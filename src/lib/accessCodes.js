const normalizeAccessCode = (code) => code.trim().toUpperCase();

const hashText = async (text) => {
  const input = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', input);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const hashAccessCode = async (code) => hashText(normalizeAccessCode(code));

export const validateAccessCode = async (supabase, code) => {
  const trimmedCode = code.trim();
  if (!trimmedCode) {
    return { isValid: false, message: 'יש להזין קוד כניסה.' };
  }

  const fallbackCode = import.meta.env.DEV ? import.meta.env.VITE_SIGNUP_ACCESS_CODE : '';
  if (fallbackCode && normalizeAccessCode(fallbackCode) === normalizeAccessCode(trimmedCode)) {
    return { isValid: true, accessCodeId: null };
  }

  const codeHash = await hashAccessCode(trimmedCode);
  const now = new Date().toISOString();

  const { data: rpcData, error: rpcError } = await supabase.rpc('validate_access_code', {
    submitted_code_hash: codeHash,
  });

  let data = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  let error = rpcError;

  if (rpcError && import.meta.env.DEV) {
    const fallbackResult = await supabase
      .from('access_codes')
      .select('id, max_uses, used_count, valid_from, valid_until')
      .eq('code_hash', codeHash)
      .eq('is_active', true)
      .maybeSingle();

    data = fallbackResult.data;
    error = fallbackResult.error;
  }

  if (error) {
    return {
      isValid: false,
      message: 'לא ניתן לבדוק את קוד הכניסה כרגע. נסה שוב בעוד רגע.',
    };
  }

  if (!data) {
    return { isValid: false, message: 'קוד הכניסה לא תקין.' };
  }

  if (data.valid_from && data.valid_from > now) {
    return { isValid: false, message: 'קוד הכניסה עדיין לא פעיל.' };
  }

  if (data.valid_until && data.valid_until < now) {
    return { isValid: false, message: 'קוד הכניסה פג תוקף.' };
  }

  if (data.max_uses && data.used_count >= data.max_uses) {
    return { isValid: false, message: 'קוד הכניסה הגיע למכסת השימושים שלו.' };
  }

  return { isValid: true, accessCodeId: data.id };
};
