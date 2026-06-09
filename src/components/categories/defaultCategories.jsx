export const defaultCategoriesData = [
  // הוצאה - בריאות
  { name: "בריאות", parent_type: "expense", parent_category_name: null, is_system: true, color: "#ef4444", icon: "❤️" },
  { name: "קופת חולים", parent_type: "expense", parent_category_name: "בריאות", is_system: true },
  { name: "טיפולים", parent_type: "expense", parent_category_name: "בריאות", is_system: true },
  { name: "תרופות", parent_type: "expense", parent_category_name: "בריאות", is_system: true },
  { name: "חדר כושר", parent_type: "expense", parent_category_name: "בריאות", is_system: true },
  { name: "רפואת שיניים", parent_type: "expense", parent_category_name: "בריאות", is_system: true },

  // הוצאה - דיור
  { name: "דיור", parent_type: "expense", parent_category_name: null, is_system: true, color: "#f97316", icon: "🏠" },
  { name: "שכר דירה", parent_type: "expense", parent_category_name: "דיור", is_system: true },
  { name: "ועד בית", parent_type: "expense", parent_category_name: "דיור", is_system: true },
  { name: "חשמל", parent_type: "expense", parent_category_name: "דיור", is_system: true },
  { name: "מים", parent_type: "expense", parent_category_name: "דיור", is_system: true },
  { name: "גז ודלק לבית", parent_type: "expense", parent_category_name: "דיור", is_system: true },
  { name: "ארנונה ומסים עירוניים", parent_type: "expense", parent_category_name: "דיור", is_system: true },
  { name: "עזרה בבית", parent_type: "expense", parent_category_name: "דיור", is_system: true },
  { name: "תחזוקה ושיפור הבית", parent_type: "expense", parent_category_name: "דיור", is_system: true },

  // הוצאה - הלבשה והנעלה
  { name: "הלבשה והנעלה", parent_type: "expense", parent_category_name: null, is_system: true, color: "#f59e0b", icon: "👕" },
  { name: "הלבשה נשים", parent_type: "expense", parent_category_name: "הלבשה והנעלה", is_system: true },
  { name: "הלבשה גברים", parent_type: "expense", parent_category_name: "הלבשה והנעלה", is_system: true },
  { name: "הלבשה ילדים", parent_type: "expense", parent_category_name: "הלבשה והנעלה", is_system: true },
  { name: "הלבשה כללי", parent_type: "expense", parent_category_name: "הלבשה והנעלה", is_system: true },
  { name: "הנעלה נשים", parent_type: "expense", parent_category_name: "הלבשה והנעלה", is_system: true },
  { name: "הנעלה גברים", parent_type: "expense", parent_category_name: "הלבשה והנעלה", is_system: true },
  { name: "הנעלה ילדים", parent_type: "expense", parent_category_name: "הלבשה והנעלה", is_system: true },
  { name: "תכשיטים ואקססוריז", parent_type: "expense", parent_category_name: "הלבשה והנעלה", is_system: true },

  // הוצאה - חינוך תרבות ובידור
  { name: "חינוך תרבות ובידור", parent_type: "expense", parent_category_name: null, is_system: true, color: "#eab308", icon: "🎭" },
  { name: "נופש וטיולים", parent_type: "expense", parent_category_name: "חינוך תרבות ובידור", is_system: true },
  { name: "בתי ספר, גנים", parent_type: "expense", parent_category_name: "חינוך תרבות ובידור", is_system: true },
  { name: "תשלומי הורים ומתנות לצוות", parent_type: "expense", parent_category_name: "חינוך תרבות ובידור", is_system: true },
  { name: "חוגים, תנועת נוער", parent_type: "expense", parent_category_name: "חינוך תרבות ובידור", is_system: true },
  { name: "שיעורים פרטיים", parent_type: "expense", parent_category_name: "חינוך תרבות ובידור", is_system: true },
  { name: "ספרי לימוד, קריאה ועיתונים", parent_type: "expense", parent_category_name: "חינוך תרבות ובידור", is_system: true },
  { name: "מכשירי כתיבה וציוד למידה", parent_type: "expense", parent_category_name: "חינוך תרבות ובידור", is_system: true },
  { name: "צעצועים", parent_type: "expense", parent_category_name: "חינוך תרבות ובידור", is_system: true },
  { name: "ציוד ספורט", parent_type: "expense", parent_category_name: "חינוך תרבות ובידור", is_system: true },
  { name: "מחנאות", parent_type: "expense", parent_category_name: "חינוך תרבות ובידור", is_system: true },
  { name: "אירועי תרבות, ספורט ובידור ובילוי", parent_type: "expense", parent_category_name: "חינוך תרבות ובידור", is_system: true },
  { name: "דמי כיס", parent_type: "expense", parent_category_name: "חינוך תרבות ובידור", is_system: true },
  { name: "השתלמויות והכשרות", parent_type: "expense", parent_category_name: "חינוך תרבות ובידור", is_system: true },
  { name: "קייטנות", parent_type: "expense", parent_category_name: "חינוך תרבות ובידור", is_system: true },

  // הוצאה - מוצרים ושירותים אחרים
  { name: "מוצרים ושירותים אחרים", parent_type: "expense", parent_category_name: null, is_system: true, color: "#84cc16", icon: "🛍️" },
  { name: "עליאקספרסס", parent_type: "expense", parent_category_name: "מוצרים ושירותים אחרים", is_system: true },
  { name: "קוסמטיקה ומוצרי טיפוח", parent_type: "expense", parent_category_name: "מוצרים ושירותים אחרים", is_system: true },
  { name: "אופטיקה", parent_type: "expense", parent_category_name: "מוצרים ושירותים אחרים", is_system: true },
  { name: "מסים", parent_type: "expense", parent_category_name: "מוצרים ושירותים אחרים", is_system: true },
  { name: "דמי חברות בארגון", parent_type: "expense", parent_category_name: "מוצרים ושירותים אחרים", is_system: true },
  { name: "תרומות", parent_type: "expense", parent_category_name: "מוצרים ושירותים אחרים", is_system: true },
  { name: "מתנות", parent_type: "expense", parent_category_name: "מוצרים ושירותים אחרים", is_system: true },
  { name: "בעלי חיים", parent_type: "expense", parent_category_name: "מוצרים ושירותים אחרים", is_system: true },
  { name: "עורך דין", parent_type: "expense", parent_category_name: "מוצרים ושירותים אחרים", is_system: true },
  { name: "רואה חשבון", parent_type: "expense", parent_category_name: "מוצרים ושירותים אחרים", is_system: true },
  { name: "הגרלות", parent_type: "expense", parent_category_name: "מוצרים ושירותים אחרים", is_system: true },

  // הוצאה - מזון
  { name: "מזון", parent_type: "expense", parent_category_name: null, is_system: true, color: "#22c55e", icon: "🛒" },
  { name: "מזון", parent_type: "expense", parent_category_name: "מזון", is_system: true },
  { name: "מכולת והשלמות", parent_type: "expense", parent_category_name: "מזון", is_system: true },
  { name: "מזון לשבת וחג", parent_type: "expense", parent_category_name: "מזון", is_system: true },
  { name: "ירקות", parent_type: "expense", parent_category_name: "מזון", is_system: true },
  { name: "בשר ודגים", parent_type: "expense", parent_category_name: "מזון", is_system: true },
  { name: "אלכוהול", parent_type: "expense", parent_category_name: "מזון", is_system: true },
  { name: "אוכל בחוץ", parent_type: "expense", parent_category_name: "מזון", is_system: true },

  // הוצאה - ריהוט וציוד לבית
  { name: "ריהוט וציוד לבית", parent_type: "expense", parent_category_name: null, is_system: true, color: "#10b981", icon: "🛋️" },
  { name: "מוצרי סטוק ויד שניה", parent_type: "expense", parent_category_name: "ריהוט וציוד לבית", is_system: true },
  { name: "ריהוט גדול", parent_type: "expense", parent_category_name: "ריהוט וציוד לבית", is_system: true },
  { name: "חפצי נוי לבית", parent_type: "expense", parent_category_name: "ריהוט וציוד לבית", is_system: true },
  { name: "מוצרי חשמל", parent_type: "expense", parent_category_name: "ריהוט וציוד לבית", is_system: true },
  { name: "חומרי בניין וחשמל", parent_type: "expense", parent_category_name: "ריהוט וציוד לבית", is_system: true },

  // הוצאה - תחבורה
  { name: "תחבורה", parent_type: "expense", parent_category_name: null, is_system: true, color: "#14b8a6", icon: "🚗" },
  { name: "דלק", parent_type: "expense", parent_category_name: "תחבורה", is_system: true },
  { name: "רישיון רכב", parent_type: "expense", parent_category_name: "תחבורה", is_system: true },
  { name: "הוצאות רכב (תיקונים, ניקיון)", parent_type: "expense", parent_category_name: "תחבורה", is_system: true },
  { name: "חניונים", parent_type: "expense", parent_category_name: "תחבורה", is_system: true },
  { name: "כבישי אגרה", parent_type: "expense", parent_category_name: "תחבורה", is_system: true },
  { name: "נסיעה בתחבורה ציבורית", parent_type: "expense", parent_category_name: "תחבורה", is_system: true },
  
  // הוצאה - תקשורת
  { name: "תקשורת", parent_type: "expense", parent_category_name: null, is_system: true, color: "#06b6d4", icon: "📱" },
  { name: "אינטרנט", parent_type: "expense", parent_category_name: "תקשורת", is_system: true },
  { name: "טלוויזיה", parent_type: "expense", parent_category_name: "תקשורת", is_system: true },
  { name: "נטפליקס", parent_type: "expense", parent_category_name: "תקשורת", is_system: true },
  { name: "אמזון", parent_type: "expense", parent_category_name: "תקשורת", is_system: true },
  { name: "דיסני", parent_type: "expense", parent_category_name: "תקשורת", is_system: true },
  { name: "טלפון סלולרי", parent_type: "expense", parent_category_name: "תקשורת", is_system: true },
  { name: "גוגל", parent_type: "expense", parent_category_name: "תקשורת", is_system: true },
  { name: "מנויי תקשורת אחרים", parent_type: "expense", parent_category_name: "תקשורת", is_system: true },

  // הוצאה - ביטוחים
  { name: "ביטוחים", parent_type: "expense", parent_category_name: null, is_system: true, color: "#0ea5e9", icon: "🛡️" },
  { name: "ביטוח רכב", parent_type: "expense", parent_category_name: "ביטוחים", is_system: true },
  { name: "ביטוח דירה", parent_type: "expense", parent_category_name: "ביטוחים", is_system: true },
  { name: "ביטוח חיים", parent_type: "expense", parent_category_name: "ביטוחים", is_system: true },
  { name: "ביטוח משכנתא", parent_type: "expense", parent_category_name: "ביטוחים", is_system: true },
  { name: "ביטוח בריאות", parent_type: "expense", parent_category_name: "ביטוחים", is_system: true },
  { name: "ביטוח אכע ותאונות אישיות", parent_type: "expense", parent_category_name: "ביטוחים", is_system: true },
  { name: "ביטוח סיעודי", parent_type: "expense", parent_category_name: "ביטוחים", is_system: true },
  { name: "ביטוח אחר", parent_type: "expense", parent_category_name: "ביטוחים", is_system: true },

  // הוצאה - עסק
  { name: "עסק", parent_type: "expense", parent_category_name: null, is_system: true, color: "#3b82f6", icon: "💼" },
  { name: "הנהלה וכלליות", parent_type: "expense", parent_category_name: "עסק", is_system: true },
  { name: "תחבורה", parent_type: "expense", parent_category_name: "עסק", is_system: true },
  { name: "טכנולוגיה", parent_type: "expense", parent_category_name: "עסק", is_system: true },
  { name: "שיווק", parent_type: "expense", parent_category_name: "עסק", is_system: true },
  { name: "ייעוץ עסקי", parent_type: "expense", parent_category_name: "עסק", is_system: true },
  { name: "תשלום לפרילנסרים", parent_type: "expense", parent_category_name: "עסק", is_system: true },
  { name: "ביטוחים", parent_type: "expense", parent_category_name: "עסק", is_system: true },
  { name: "ציוד לא מתכלה", parent_type: "expense", parent_category_name: "עסק", is_system: true },
  { name: "ציוד מתכלה", parent_type: "expense", parent_category_name: "עסק", is_system: true },

  // הוצאה - הלוואות
  { name: "הלוואות", parent_type: "expense", parent_category_name: null, is_system: true, color: "#6366f1", icon: "🏦" },
  { name: "משכנתה", parent_type: "expense", parent_category_name: "הלוואות", is_system: true },
  { name: "הלוואה", parent_type: "expense", parent_category_name: "הלוואות", is_system: true },

  // הוצאה - עמלות
  { name: "עמלות בנקים וכרטיסי אשראי", parent_type: "expense", parent_category_name: null, is_system: true, color: "#8b5cf6", icon: "💳" },
  { name: "עמלות ניהול חשבון", parent_type: "expense", parent_category_name: "עמלות בנקים וכרטיסי אשראי", is_system: true },
  { name: "עמלות כרטיסי אשראי", parent_type: "expense", parent_category_name: "עמלות בנקים וכרטיסי אשראי", is_system: true },
  { name: "ריבית עו\"ש", parent_type: "expense", parent_category_name: "עמלות בנקים וכרטיסי אשראי", is_system: true },
  { name: "עמלות - אחר", parent_type: "expense", parent_category_name: "עמלות בנקים וכרטיסי אשראי", is_system: true },

  // הוצאה - חסכונות
  { name: "חסכונות", parent_type: "expense", parent_category_name: null, is_system: true, color: "#a855f7", icon: "💰" },
  { name: "חיסכון לקרן חירום", parent_type: "expense", parent_category_name: "חסכונות", is_system: true },
  { name: "חיסכון לבלת\"מ", parent_type: "expense", parent_category_name: "חסכונות", is_system: true },
  { name: "חיסכון ליעדים", parent_type: "expense", parent_category_name: "חסכונות", is_system: true },
  { name: "חיסכון לילדים", parent_type: "expense", parent_category_name: "חסכונות", is_system: true },
  { name: "חיסכון לפרישה", parent_type: "expense", parent_category_name: "חסכונות", is_system: true },
  { name: "חסכונות - אחר", parent_type: "expense", parent_category_name: "חסכונות", is_system: true },

  // הכנסה - משכורות
  { name: "משכורות", parent_type: "income", parent_category_name: null, is_system: true, color: "#16a34a", icon: "💵" },
  { name: "משכורת 1", parent_type: "income", parent_category_name: "משכורות", is_system: true },
  { name: "משכורת 2", parent_type: "income", parent_category_name: "משכורות", is_system: true },
  { name: "עסק 1", parent_type: "income", parent_category_name: "משכורות", is_system: true },
  { name: "עסק 2", parent_type: "income", parent_category_name: "משכורות", is_system: true },

  // הכנסה - הכנסות נוספות
  { name: "הכנסות נוספות", parent_type: "income", parent_category_name: null, is_system: true, color: "#65a30d", icon: "➕" },
  { name: "קצבה", parent_type: "income", parent_category_name: "הכנסות נוספות", is_system: true },
  { name: "תמיכה ממשפחה", parent_type: "income", parent_category_name: "הכנסות נוספות", is_system: true },
  { name: "מזונות", parent_type: "income", parent_category_name: "הכנסות נוספות", is_system: true },
  
  // הכנסה - הכנסה פסיבית
  { name: "הכנסה פסיבית", parent_type: "income", parent_category_name: null, is_system: true, color: "#059669", icon: "📈" },
  { name: "הכנסה מנכס", parent_type: "income", parent_category_name: "הכנסה פסיבית", is_system: true },
  
  // הכנסה - החזרים
  { name: "החזרים", parent_type: "income", parent_category_name: null, is_system: true, color: "#0d9488", icon: "🔄" },
  { name: "החזרים", parent_type: "income", parent_category_name: "החזרים", is_system: true },
];