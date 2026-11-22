"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type BugAutopsy = {
  id: string;
  user_id: string;
  title: string;
  language: string;
  bug_category: string;
  broken_code: string;
  error_output: string;
  diagnosis: string;
  fixed_code: string;
  walkthrough: string;
  challenge_code: string;
  challenge_hint: string;
  status: "Needs Practice" | "Mastered";
  created_at: string;
};

type UILanguage = "en" | "zh" | "es" | "fr" | "mn";
type ThemeMode = "dark" | "light";

const LANGUAGES = [
  "Python",
  "JavaScript",
  "TypeScript",
  "C++",
  "Java",
  "SQL",
  "HTML/CSS",
];

const UI_LANGUAGES: { code: UILanguage; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "mn", label: "Монгол", flag: "🇲🇳" },
];

const TRANSLATIONS: Record<
  UILanguage,
  {
    appName: string;
    tagline: string;
    navCheck: string;
    navSaved: string;
    navPractice: string;
    navSettings: string;
    collapse: string;
    expand: string;
    totalChecked: string;
    stillLearning: string;
    gotIt: string;
    commonIssue: string;
    noneYet: string;
    pasteTitle: string;
    pasteSub: string;
    language: string;
    tryExample: string;
    codePlaceholder: string;
    errorToggle: string;
    errorLabel: string;
    hide: string;
    errorPlaceholder: string;
    checkButton: string;
    checkingButton: string;
    filterAll: string;
    filterStillLearning: string;
    filterGotIt: string;
    searchPlaceholder: string;
    filters: string;
    resetFilters: string;
    category: string;
    loadingBugs: string;
    noBugsTitle: string;
    noBugsSub: string;
    whatWentWrong: string;
    howToFix: string;
    brokenCode: string;
    fixedCode: string;
    explanation: string;
    copyFix: string;
    copied: string;
    markGotIt: string;
    markStillLearning: string;
    delete: string;
    deleteConfirm: string;
    practiceChallenge: string;
    practiceSub: string;
    showHint: string;
    hideHint: string;
    hintLabel: string;
    revealSolution: string;
    quizStillLearning: string;
    testYourself: string;
    exportNotes: string;
    signOut: string;
    settingsTitle: string;
    settingsSub: string;
    appearance: string;
    themeDark: string;
    themeLight: string;
    uiLanguage: string;
    account: string;
    signedInAs: string;
    totalAutopsies: string;
    masteredCount: string;
    dangerZone: string;
    logOutButton: string;
    welcomeTitle: string;
    welcomeSub: string;
    signIn: string;
    createAccount: string;
    emailLabel: string;
    passwordLabel: string;
    or: string;
    continueGoogle: string;
    autopsyComplete: string;
    allMasteredAlert: string;
    practiceBanner: string;
    notesExported: string;
  }
> = {
  en: {
    appName: "Bug Autopsy Lab",
    tagline: "Find the mistake. Learn how to fix it.",
    navCheck: "Check Code",
    navSaved: "Saved Fixes",
    navPractice: "Practice Game",
    navSettings: "Settings",
    collapse: "Collapse",
    expand: "Expand",
    totalChecked: "Total Checked",
    stillLearning: "Still Learning",
    gotIt: "Got It!",
    commonIssue: "Common Issue",
    noneYet: "None yet",
    pasteTitle: "Paste Broken Code",
    pasteSub: "Choose your language, paste what is not working, and click Check My Code.",
    language: "Language",
    tryExample: "Try an Example",
    codePlaceholder: "Paste the code you want us to inspect here...",
    errorToggle: "+ Did you get an error message? (Optional)",
    errorLabel: "Error message or what went wrong (Optional)",
    hide: "Hide",
    errorPlaceholder: "e.g. IndexError: list index out of range",
    checkButton: "Check My Code",
    checkingButton: "Checking Your Code...",
    filterAll: "All",
    filterStillLearning: "Still Learning",
    filterGotIt: "Got It!",
    searchPlaceholder: "Search your saved bugs...",
    filters: "Filters",
    resetFilters: "Reset filters",
    category: "Category",
    loadingBugs: "Loading your bugs...",
    noBugsTitle: "No bugs to show",
    noBugsSub: "Paste any broken code snippet to get your first autopsy.",
    whatWentWrong: "What Went Wrong",
    howToFix: "How to Fix It",
    brokenCode: "❌ Broken Code",
    fixedCode: "✅ How to Fix It",
    explanation: "Explanation of the Fix",
    copyFix: "Copy Fix",
    copied: "Copied!",
    markGotIt: "✓ Mark as Got It!",
    markStillLearning: "↺ Mark as Still Learning",
    delete: "Delete",
    deleteConfirm: "Are you sure you want to remove this bug?",
    practiceChallenge: "🎯 Practice Challenge",
    practiceSub: "Can you spot the mistake in this code before seeing the fix?",
    showHint: "Show Hint",
    hideHint: "Hide Hint",
    hintLabel: "Hint:",
    revealSolution: "Reveal Solution",
    quizStillLearning: "Quiz Still Learning",
    testYourself: "🎯 Test yourself: Spot this bug in another puzzle",
    exportNotes: "Export Notes (.md)",
    signOut: "Sign Out",
    settingsTitle: "Settings & Preferences",
    settingsSub: "Personalize your learning experience and manage your account.",
    appearance: "Theme & Appearance",
    themeDark: "Dark Mode",
    themeLight: "Light Mode",
    uiLanguage: "Language / 语言 / Idioma / Langue / Хэл",
    account: "Account Information",
    signedInAs: "Signed in as",
    totalAutopsies: "Total Saved Autopsies",
    masteredCount: "Mastered Fixes",
    dangerZone: "Account Actions",
    logOutButton: "Log Out of Lab",
    welcomeTitle: "AI Code & Bug Autopsy Lab",
    welcomeSub: "Paste broken code. See what went wrong. Learn how to fix it with ease.",
    signIn: "Sign In",
    createAccount: "Create Account",
    emailLabel: "Email",
    passwordLabel: "Password",
    or: "or",
    continueGoogle: "Continue with Google",
    autopsyComplete: "Autopsy complete! Found the issue:",
    allMasteredAlert: "Awesome work! You've mastered all your logged bugs.",
    practiceBanner: "Practice Game: Spot the mistake in this code!",
    notesExported: "Saved notes as Markdown file.",
  },
  zh: {
    appName: "代码验尸实验室",
    tagline: "找出错误，轻松学会如何修复。",
    navCheck: "检查代码",
    navSaved: "已保存修复",
    navPractice: "练习游戏",
    navSettings: "偏好设置",
    collapse: "收起",
    expand: "展开",
    totalChecked: "已检查总数",
    stillLearning: "仍在学习",
    gotIt: "我懂了！",
    commonIssue: "常见问题",
    noneYet: "暂无",
    pasteTitle: "粘贴出错的代码",
    pasteSub: "选择编程语言，粘贴未正常运行的代码，然后点击“检查我的代码”。",
    language: "编程语言",
    tryExample: "试用示例",
    codePlaceholder: "在此粘贴需要检查的代码...",
    errorToggle: "+ 有报错信息吗？（可选）",
    errorLabel: "报错信息或意外输出（可选）",
    hide: "隐藏",
    errorPlaceholder: "例如：IndexError: list index out of range",
    checkButton: "检查我的代码",
    checkingButton: "正在检查您的代码...",
    filterAll: "全部",
    filterStillLearning: "仍在学习",
    filterGotIt: "我懂了！",
    searchPlaceholder: "搜索已保存的错误...",
    filters: "高级筛选",
    resetFilters: "重置筛选",
    category: "错误类别",
    loadingBugs: "正在加载您的错误记录...",
    noBugsTitle: "暂无记录",
    noBugsSub: "在上方粘贴出错的代码片段，获取您的第一份诊断。",
    whatWentWrong: "问题出在哪里",
    howToFix: "如何修复",
    brokenCode: "❌ 出错的代码",
    fixedCode: "✅ 修复后的代码",
    explanation: "修复原理解析",
    copyFix: "复制修复代码",
    copied: "已复制！",
    markGotIt: "✓ 标记为已掌握！",
    markStillLearning: "↺ 标记为仍在学习",
    delete: "删除",
    deleteConfirm: "确定要删除这条错误记录吗？",
    practiceChallenge: "🎯 练习挑战",
    practiceSub: "在查看答案之前，你能找出这段代码中的错误吗？",
    showHint: "查看提示",
    hideHint: "隐藏提示",
    hintLabel: "提示：",
    revealSolution: "查看答案与修复",
    quizStillLearning: "抽查未掌握的代码",
    testYourself: "🎯 自我测试：在另一个谜题中找出类似错误",
    exportNotes: "导出笔记 (.md)",
    signOut: "退出登录",
    settingsTitle: "偏好与设置",
    settingsSub: "个性化您的学习体验并管理您的个人账户。",
    appearance: "外观主题",
    themeDark: "深色模式",
    themeLight: "浅色模式",
    uiLanguage: "界面语言",
    account: "账户详情",
    signedInAs: "当前登录账号",
    totalAutopsies: "已保存诊断总数",
    masteredCount: "已掌握数量",
    dangerZone: "账户操作",
    logOutButton: "退出当前账户",
    welcomeTitle: "AI 代码验尸实验室",
    welcomeSub: "粘贴出错代码。看清哪里出了问题。轻松学会如何修复。",
    signIn: "登录",
    createAccount: "创建新账户",
    emailLabel: "邮箱",
    passwordLabel: "密码",
    or: "或",
    continueGoogle: "使用 Google 继续",
    autopsyComplete: "诊断完成！发现问题：",
    allMasteredAlert: "太棒了！所有记录的错误您都已掌握。",
    practiceBanner: "练习挑战：快找出这段代码中的错误吧！",
    notesExported: "已将笔记保存为 Markdown 文件。",
  },
  es: {
    appName: "Laboratorio de Autopsia de Errores",
    tagline: "Encuentra el error. Aprende a solucionarlo fácilmente.",
    navCheck: "Revisar Código",
    navSaved: "Arreglos Guardados",
    navPractice: "Juego de Práctica",
    navSettings: "Configuración",
    collapse: "Contraer",
    expand: "Expandir",
    totalChecked: "Total Revisados",
    stillLearning: "Aprendiendo",
    gotIt: "¡Entendido!",
    commonIssue: "Problema Común",
    noneYet: "Ninguno aún",
    pasteTitle: "Pega el Código Roto",
    pasteSub: "Elige tu lenguaje, pega lo que no funcione y haz clic en Revisar mi Código.",
    language: "Lenguaje",
    tryExample: "Probar un Ejemplo",
    codePlaceholder: "Pega aquí el código que quieres revisar...",
    errorToggle: "+ ¿Tuviste algún mensaje de error? (Opcional)",
    errorLabel: "Mensaje de error o qué falló (Opcional)",
    hide: "Ocultar",
    errorPlaceholder: "ej. IndexError: list index out of range",
    checkButton: "Revisar Mi Código",
    checkingButton: "Revisando Tu Código...",
    filterAll: "Todos",
    filterStillLearning: "Aprendiendo",
    filterGotIt: "¡Entendido!",
    searchPlaceholder: "Buscar errores guardados...",
    filters: "Filtros",
    resetFilters: "Restablecer filtros",
    category: "Categoría",
    loadingBugs: "Cargando tus errores...",
    noBugsTitle: "No hay errores que mostrar",
    noBugsSub: "Pega un código roto arriba para ver tu primera autopsia.",
    whatWentWrong: "¿Qué Salió Mal?",
    howToFix: "Cómo Solucionarlo",
    brokenCode: "❌ Código con Error",
    fixedCode: "✅ Cómo Debe Quedar",
    explanation: "Explicación de la Solución",
    copyFix: "Copiar Arreglo",
    copied: "¡Copiado!",
    markGotIt: "✓ ¡Marcar como Entendido!",
    markStillLearning: "↺ Marcar como Aprendiendo",
    delete: "Eliminar",
    deleteConfirm: "¿Estás seguro de que deseas eliminar este error?",
    practiceChallenge: "🎯 Desafío de Práctica",
    practiceSub: "¿Puedes detectar el error antes de ver la solución?",
    showHint: "Ver Pista",
    hideHint: "Ocultar Pista",
    hintLabel: "Pista:",
    revealSolution: "Revelar Solución",
    quizStillLearning: "Cuestionario de Aprendizaje",
    testYourself: "🎯 Ponte a prueba: Detecta este error en otro acertijo",
    exportNotes: "Exportar Notas (.md)",
    signOut: "Cerrar Sesión",
    settingsTitle: "Configuración y Preferencias",
    settingsSub: "Personaliza tu aprendizaje y administra tu cuenta.",
    appearance: "Tema y Apariencia",
    themeDark: "Modo Oscuro",
    themeLight: "Modo Claro",
    uiLanguage: "Idioma de la interfaz",
    account: "Información de la Cuenta",
    signedInAs: "Sesión iniciada como",
    totalAutopsies: "Total de autopsias guardadas",
    masteredCount: "Arreglos dominados",
    dangerZone: "Acciones de Cuenta",
    logOutButton: "Cerrar Sesión",
    welcomeTitle: "Laboratorio de Autopsia de Errores",
    welcomeSub: "Pega código roto. Descubre qué falló. Aprende a solucionarlo sin enredos.",
    signIn: "Iniciar Sesión",
    createAccount: "Crear Cuenta",
    emailLabel: "Correo Electrónico",
    passwordLabel: "Contraseña",
    or: "o",
    continueGoogle: "Continuar con Google",
    autopsyComplete: "¡Autopsia lista! Problema detectado:",
    allMasteredAlert: "¡Excelente trabajo! Has dominado todos tus errores guardados.",
    practiceBanner: "Desafío de práctica: ¡Encuentra el error en este código!",
    notesExported: "Notas guardadas como archivo Markdown.",
  },
  fr: {
    appName: "Laboratoire d'Autopsie de Bugs",
    tagline: "Trouvez l'erreur. Apprenez à la corriger facilement.",
    navCheck: "Vérifier le Code",
    navSaved: "Corrections Sauvegardées",
    navPractice: "Jeu d'Entraînement",
    navSettings: "Paramètres",
    collapse: "Réduire",
    expand: "Agrandir",
    totalChecked: "Total Vérifiés",
    stillLearning: "En apprentissage",
    gotIt: "Compris !",
    commonIssue: "Problème Fréquent",
    noneYet: "Aucun pour l'instant",
    pasteTitle: "Collez le Code Défaillant",
    pasteSub: "Choisissez votre langage, collez votre code et cliquez sur Vérifier mon Code.",
    language: "Langage",
    tryExample: "Essayer un Exemple",
    codePlaceholder: "Collez ici le code à inspecter...",
    errorToggle: "+ Avez-vous eu un message d'erreur ? (Optionnel)",
    errorLabel: "Message d'erreur ou comportement inattendu (Optionnel)",
    hide: "Masquer",
    errorPlaceholder: "ex. IndexError: list index out of range",
    checkButton: "Vérifier Mon Code",
    checkingButton: "Vérification en cours...",
    filterAll: "Tous",
    filterStillLearning: "En apprentissage",
    filterGotIt: "Compris !",
    searchPlaceholder: "Rechercher dans vos bugs...",
    filters: "Filtres",
    resetFilters: "Réinitialiser les filtres",
    category: "Catégorie",
    loadingBugs: "Chargement de vos bugs...",
    noBugsTitle: "Aucun bug à afficher",
    noBugsSub: "Collez du code ci-dessus pour réaliser votre première autopsie.",
    whatWentWrong: "Ce Qui S'est Passé",
    howToFix: "Comment le Corriger",
    brokenCode: "❌ Code Défaillant",
    fixedCode: "✅ Code Corrigé",
    explanation: "Explication de la Correction",
    copyFix: "Copier le Code",
    copied: "Copié !",
    markGotIt: "✓ Marquer comme Compris !",
    markStillLearning: "↺ Marquer en Apprentissage",
    delete: "Supprimer",
    deleteConfirm: "Voulez-vous vraiment supprimer ce bug ?",
    practiceChallenge: "🎯 Défi d'Entraînement",
    practiceSub: "Pouvez-vous repérer l'erreur avant de regarder la solution ?",
    showHint: "Voir l'Indice",
    hideHint: "Masquer l'Indice",
    hintLabel: "Indice :",
    revealSolution: "Révéler la Solution",
    quizStillLearning: "Quiz des Non Maîtrisés",
    testYourself: "🎯 Testez-vous : repérez ce bug dans une autre énigme",
    exportNotes: "Exporter les Notes (.md)",
    signOut: "Se Déconnecter",
    settingsTitle: "Paramètres & Préférences",
    settingsSub: "Personnalisez votre interface et gérez votre compte.",
    appearance: "Apparence & Thème",
    themeDark: "Mode Sombre",
    themeLight: "Mode Clair",
    uiLanguage: "Langue de l'interface",
    account: "Informations du Compte",
    signedInAs: "Connecté en tant que",
    totalAutopsies: "Total des autopsies enregistrées",
    masteredCount: "Bugs maîtrisés",
    dangerZone: "Actions du Compte",
    logOutButton: "Se Déconnecter du Lab",
    welcomeTitle: "Laboratoire d'Autopsie de Bugs",
    welcomeSub: "Collez un code défaillant. Comprenez l'erreur. Corrigez-la sereinement.",
    signIn: "Connexion",
    createAccount: "Créer un Compte",
    emailLabel: "Adresse e-mail",
    passwordLabel: "Mot de passe",
    or: "ou",
    continueGoogle: "Continuer avec Google",
    autopsyComplete: "Autopsie terminée ! Problème identifié :",
    allMasteredAlert: "Bravo ! Vous avez maîtrisé tous vos bugs enregistrés.",
    practiceBanner: "Défi d'entraînement : repérez l'erreur dans ce code !",
    notesExported: "Notes exportées au format Markdown.",
  },
  mn: {
    appName: "Кодын Алдаа Шинжлэх Лаборатори",
    tagline: "Алдааг олж, хэрхэн засахыг хялбархан сур.",
    navCheck: "Код Шалгах",
    navSaved: "Хадгалсан Засварууд",
    navPractice: "Дадлага Тоглоом",
    navSettings: "Тохиргоо",
    collapse: "Хураах",
    expand: "Дэлгэх",
    totalChecked: "Нийт Шалгасан",
    stillLearning: "Суралцаж байна",
    gotIt: "Ойлголоо!",
    commonIssue: "Түгээмэл Алдаа",
    noneYet: "Одоогоор алга",
    pasteTitle: "Алдаатай Кодоо Энд Буулгана Уу",
    pasteSub: "Програмчлалын хэлээ сонгоод, ажиллахгүй байгаа кодоо оруулж 'Миний Кодыг Шалга' товчийг дарна уу.",
    language: "Хэл",
    tryExample: "Жишээ Үзэх",
    codePlaceholder: "Шалгуулах кодоо энд буулгана уу...",
    errorToggle: "+ Алдааны мэдээлэл гарсан уу? (Заавал биш)",
    errorLabel: "Алдааны мэдээлэл эсвэл юу болохгүй байгаа тухай (Заавал биш)",
    hide: "Нуух",
    errorPlaceholder: "жишээ нь: IndexError: list index out of range",
    checkButton: "Миний Кодыг Шалга",
    checkingButton: "Кодыг тань шалгаж байна...",
    filterAll: "Бүгд",
    filterStillLearning: "Суралцаж байна",
    filterGotIt: "Ойлголоо!",
    searchPlaceholder: "Хадгалсан алдаануудаас хайх...",
    filters: "Шүүлтүүр",
    resetFilters: "Шүүлтүүр арилгах",
    category: "Алдааны Төрөл",
    loadingBugs: "Алдааны бүртгэлийг уншиж байна...",
    noBugsTitle: "Алдааны бүртгэл олдсонгүй",
    noBugsSub: "Дээрх хэсэгт алдаатай кодоо оруулж анхны шинжилгээгээ хийнэ үү.",
    whatWentWrong: "Юу Буруу Болсон Бэ?",
    howToFix: "Хэрхэн Засах Вэ",
    brokenCode: "❌ Алдаатай Код",
    fixedCode: "✅ Зөв Зассан Код",
    explanation: "Засварын Тайлбар",
    copyFix: "Засварыг Хуулах",
    copied: "Хуулагдлаа!",
    markGotIt: "✓ Ойлголоо гэж тэмдэглэх",
    markStillLearning: "↺ Дахин суралцах гэж тэмдэглэх",
    delete: "Устгах",
    deleteConfirm: "Энэ алдааны тэмдэглэлийг устгахдаа итгэлтэй байна уу?",
    practiceChallenge: "🎯 Дадлагын Сорил",
    practiceSub: "Зөв хариуг харахаасаа өмнө энэ кодын алдааг олж чадах уу?",
    showHint: "Зөвлөмж Харах",
    hideHint: "Зөвлөмж Нуух",
    hintLabel: "Зөвлөмж:",
    revealSolution: "Шийдлийг Харах",
    quizStillLearning: "Суралцаж буйг шалгах",
    testYourself: "🎯 Өөрийгөө сорь: Үүнтэй төстэй оньсогоноос алдааг ол",
    exportNotes: "Тэмдэглэл татах (.md)",
    signOut: "Гарах",
    settingsTitle: "Тохиргоо & Хувийн Сонголт",
    settingsSub: "Суралцах орчноо өөртөө тохируулж, бүртгэлээ удирдаарай.",
    appearance: "Өнгө & Загвар",
    themeDark: "Харанхуй горим (Dark)",
    themeLight: "Гэгээлэг горим (Light)",
    uiLanguage: "Интерфэйсийн Хэл",
    account: "Хэрэглэгчийн Мэдээлэл",
    signedInAs: "Нэвтэрсэн хэрэглэгч",
    totalAutopsies: "Нийт Хадгалсан Шинжилгээ",
    masteredCount: "Ойлгож Эзэмшсэн",
    dangerZone: "Бүртгэлийн Үйлдэл",
    logOutButton: "Лабораториос Гарах",
    welcomeTitle: "Кодын Алдаа Шинжлэх Лаборатори",
    welcomeSub: "Алдаатай кодоо оруул. Юу буруу болсныг олж мэд. Хэрхэн засахыг хялбархан сур.",
    signIn: "Нэвтрэх",
    createAccount: "Бүртгүүлэх",
    emailLabel: "И-мэйл хаяг",
    passwordLabel: "Нууц үг",
    or: "эсвэл",
    continueGoogle: "Google-ээр үргэлжлүүлэх",
    autopsyComplete: "Шинжилгээ бэлэн боллоо! Илэрсэн алдаа:",
    allMasteredAlert: "Маш сайн байна! Та бүртгэгдсэн бүх алдаагаа бүрэн ойлгож эзэмшсэн байна.",
    practiceBanner: "Дадлага сорил: Энэ код дахь алдааг олоорой!",
    notesExported: "Тэмдэглэлийг Markdown файлаар хадгаллаа.",
  },
};

const SAMPLE_BUGS: Record<string, { error: string; code: string }> = {
  Python: {
    error: "IndexError: list index out of range",
    code: `def average_pairs(nums):
    result = []
    for i in range(len(nums)):
        # Bug: nums[i + 1] goes past the end of the list
        pair_avg = (nums[i] + nums[i + 1]) / 2
        result.append(pair_avg)
    return result

print(average_pairs([10, 20, 30, 40]))`,
  },
  JavaScript: {
    error: "Logs 3, 3, 3 instead of 0, 1, 2",
    code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    // Bug: 'var' is function-scoped, not block-scoped
    console.log("Index:", i);
  }, 100);
}`,
  },
  TypeScript: {
    error: "TypeError: Cannot read properties of undefined (reading 'toUpperCase')",
    code: `type Profile = { username?: string };

function formatBadge(user: Profile) {
  // Bug: username can be undefined
  return "@" + user.username.trim().toUpperCase();
}

console.log(formatBadge({}));`,
  },
};

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Authentication form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  // Appearance & Localization settings
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [uiLang, setUiLang] = useState<UILanguage>("en");
  const [activeTab, setActiveTab] = useState<"check" | "saved" | "practice" | "settings">("check");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Autopsy data & UI state
  const [autopsies, setAutopsies] = useState<BugAutopsy[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [banner, setBanner] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Code input state
  const [language, setLanguage] = useState("Python");
  const [brokenCode, setBrokenCode] = useState("");
  const [errorOutput, setErrorOutput] = useState("");
  const [showErrorField, setShowErrorField] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Needs Practice" | "Mastered">("All");
  const [languageFilter, setLanguageFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Practice & Game state
  const [bugHuntMode, setBugHuntMode] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const t = TRANSLATIONS[uiLang];

  // Load autopsies safely
  async function loadUserAutopsies(userId: string) {
    setDataLoading(true);
    setBanner(null);
    const { data, error } = await supabase
      .from("bug_autopsies")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      setBanner({ type: "error", text: error.message });
    } else if (data) {
      setAutopsies(data as BugAutopsy[]);
    }
    setDataLoading(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const initialUser = data.session?.user ?? null;
      setUser(initialUser);
      setAuthLoading(false);
      if (initialUser) {
        loadUserAutopsies(initialUser.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        loadUserAutopsies(nextUser.id);
      } else {
        setAutopsies([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleAuthSubmit(e: FormEvent) {
    e.preventDefault();
    setAuthMessage("");

    if (!email.trim() || !password.trim()) {
      setAuthMessage("Please enter your email and password.");
      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setAuthMessage(error.message);
      } else {
        setAuthMessage("Account created! Check your email if verification is required, or sign in now.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthMessage(error.message);
      }
    }
  }

  async function handleGoogleSignIn() {
    setAuthMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      setAuthMessage(error.message);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  function loadSampleBug() {
    const sample = SAMPLE_BUGS[language] ?? SAMPLE_BUGS.Python;
    if (!SAMPLE_BUGS[language]) setLanguage("Python");
    setErrorOutput(sample.error);
    setBrokenCode(sample.code);
    setShowErrorField(true);
  }

  async function handleRunAutopsy(e: FormEvent) {
    e.preventDefault();
    if (!user || !brokenCode.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setBanner(null);

    try {
      const res = await fetch("/api/autopsy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          brokenCode: brokenCode.trim(),
          errorOutput: errorOutput.trim(),
        }),
      });

      const aiData = await res.json();
      if (!res.ok) {
        setBanner({ type: "error", text: aiData.error || "Could not analyze the code. Please try again." });
        setIsAnalyzing(false);
        return;
      }

      const { data, error } = await supabase
        .from("bug_autopsies")
        .insert({
          user_id: user.id,
          title: aiData.title,
          language,
          bug_category: aiData.bug_category,
          broken_code: brokenCode.trim(),
          error_output: errorOutput.trim(),
          diagnosis: aiData.diagnosis,
          fixed_code: aiData.fixed_code,
          walkthrough: aiData.walkthrough,
          challenge_code: aiData.challenge_code,
          challenge_hint: aiData.challenge_hint,
          status: "Needs Practice",
        })
        .select()
        .single();

      if (error) {
        setBanner({ type: "error", text: `Diagnosed, but couldn't save to database: ${error.message}` });
      } else if (data) {
        const created = data as BugAutopsy;
        setAutopsies((prev) => [created, ...prev]);
        setBrokenCode("");
        setErrorOutput("");
        setShowErrorField(false);
        setHighlightedId(created.id);
        setActiveTab("saved");
        setBanner({
          type: "success",
          text: `${t.autopsyComplete} "${created.title}".`,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error. Please check your connection.";
      setBanner({ type: "error", text: msg });
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleToggleStatus(item: BugAutopsy) {
    const nextStatus = item.status === "Needs Practice" ? "Mastered" : "Needs Practice";
    const { data, error } = await supabase
      .from("bug_autopsies")
      .update({ status: nextStatus })
      .eq("id", item.id)
      .select()
      .single();

    if (error) {
      setBanner({ type: "error", text: `Could not update status: ${error.message}` });
      return;
    }

    if (data) {
      setAutopsies((prev) => prev.map((row) => (row.id === item.id ? (data as BugAutopsy) : row)));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t.deleteConfirm)) return;
    const { error } = await supabase.from("bug_autopsies").delete().eq("id", id);
    if (error) {
      setBanner({ type: "error", text: `Could not delete: ${error.message}` });
      return;
    }
    setAutopsies((prev) => prev.filter((row) => row.id !== id));
  }

  async function handleCopyCode(id: string, code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
    } catch {
      setBanner({ type: "error", text: "Clipboard permission denied." });
    }
  }

  function handleQuizRandomBug() {
    const pool = autopsies.filter((a) => a.status === "Needs Practice");
    if (pool.length === 0) {
      setBanner({ type: "success", text: t.allMasteredAlert });
      return;
    }
    const picked = pool[Math.floor(Math.random() * pool.length)];
    setActiveTab("practice");
    setBugHuntMode(true);
    setStatusFilter("Needs Practice");
    setLanguageFilter("All");
    setCategoryFilter("All");
    setSearchQuery("");
    setRevealedAnswers((prev) => ({ ...prev, [picked.id]: false }));
    setRevealedHints((prev) => ({ ...prev, [picked.id]: false }));
    setHighlightedId(picked.id);
    setBanner({
      type: "success",
      text: `${t.practiceBanner} ("${picked.title}")`,
    });
  }

  function handleExportMarkdown() {
    if (autopsies.length === 0) return;

    const md = autopsies
      .map(
        (item) => `## ${item.title} (${item.language} • ${item.bug_category})
- **Status:** ${item.status === "Mastered" ? "Got It" : "Still Learning"}
- **Error:** ${item.error_output || "None"}

### What Went Wrong
${item.diagnosis}

### Broken Code
\`\`\`${item.language.toLowerCase()}
${item.broken_code}
\`\`\`

### How to Fix It
\`\`\`${item.language.toLowerCase()}
${item.fixed_code}
\`\`\`

### Explanation
${item.walkthrough}
`
      )
      .join("\n---\n\n");

    const blob = new Blob([`# My Bug Learning Notes\n\n${md}`], {
      type: "text/markdown;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-bug-notes.md";
    link.click();
    URL.revokeObjectURL(url);
    setBanner({ type: "success", text: `${t.notesExported} (${autopsies.length})` });
  }

  const stats = useMemo(() => {
    const total = autopsies.length;
    const mastered = autopsies.filter((a) => a.status === "Mastered").length;
    const needsPractice = total - mastered;

    const categoryCounts: Record<string, number> = {};
    for (const a of autopsies) {
      categoryCounts[a.bug_category] = (categoryCounts[a.bug_category] || 0) + 1;
    }
    const topCategoryEntry = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
    const topBug = topCategoryEntry ? topCategoryEntry[0] : t.noneYet;

    return { total, mastered, needsPractice, topBug };
  }, [autopsies, t.noneYet]);

  const availableLanguages = useMemo(
    () => ["All", ...Array.from(new Set(autopsies.map((a) => a.language).filter(Boolean)))],
    [autopsies]
  );

  const availableCategories = useMemo(
    () => ["All", ...Array.from(new Set(autopsies.map((a) => a.bug_category).filter(Boolean)))],
    [autopsies]
  );

  const filteredAutopsies = useMemo(() => {
    return autopsies.filter((item) => {
      const matchesLang = languageFilter === "All" || item.language === languageFilter;
      const matchesCat = categoryFilter === "All" || item.bug_category === categoryFilter;
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.bug_category.toLowerCase().includes(q) ||
        item.diagnosis.toLowerCase().includes(q) ||
        item.broken_code.toLowerCase().includes(q) ||
        item.error_output.toLowerCase().includes(q);
      return matchesLang && matchesCat && matchesStatus && matchesQuery;
    });
  }, [autopsies, languageFilter, categoryFilter, statusFilter, searchQuery]);

  // Loading view
  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400 font-sans text-base">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span>Opening Bug Autopsy Lab...</span>
        </div>
      </main>
    );
  }

  // Signed out / Auth view
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 p-6 text-zinc-100 font-sans">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur">
          <div className="text-center">
            <span className="inline-block text-3xl mb-2">🩺</span>
            <h1 className="text-2xl font-bold tracking-tight text-white">{t.welcomeTitle}</h1>
            <p className="mt-2 text-base text-zinc-400">{t.welcomeSub}</p>
          </div>

          <div className="mt-8 flex rounded-xl bg-zinc-950 p-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setAuthMessage("");
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                !isSignUp ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t.signIn}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setAuthMessage("");
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                isSignUp ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t.createAccount}
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                {t.emailLabel}
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                {t.passwordLabel}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-emerald-500"
              />
            </div>

            {authMessage && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-300">
                {authMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 rounded-xl bg-emerald-500 px-5 py-3 text-base font-semibold text-zinc-950 transition hover:bg-emerald-400 active:scale-[0.99]"
            >
              {isSignUp ? t.createAccount : t.signIn}
            </button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <span className="relative bg-zinc-900 px-3 text-xs uppercase tracking-wider text-zinc-500">
              {t.or}
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 active:scale-[0.99]"
          >
            {t.continueGoogle}
          </button>
        </div>
      </main>
    );
  }

  // Active theme classes
  const isDark = theme === "dark";
  const bgMain = isDark ? "bg-zinc-950 text-zinc-100" : "bg-slate-50 text-slate-900";
  const bgCard = isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-slate-200 shadow-sm";
  const bgSubCard = isDark ? "bg-zinc-950/70 border-zinc-800" : "bg-slate-50 border-slate-200";
  const textMuted = isDark ? "text-zinc-400" : "text-slate-500";
  const borderTone = isDark ? "border-zinc-800" : "border-slate-200";
  const inputBg = isDark
    ? "bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500"
    : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600";

  return (
    <div className={`min-h-screen flex ${bgMain} font-sans selection:bg-emerald-500/30 transition-colors duration-200`}>
      {/* 1. Left Sidebar (~240px wide or collapsible) */}
      <aside
        className={`${
          sidebarCollapsed ? "w-18" : "w-60"
        } shrink-0 border-r ${borderTone} flex flex-col justify-between transition-all duration-300 select-none ${
          isDark ? "bg-zinc-950/95" : "bg-white/95"
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Logo & Brand Title */}
          <div className="flex items-center justify-between">
            <div
              onClick={() => setActiveTab("check")}
              className="flex items-center gap-3 cursor-pointer overflow-hidden"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl">
                🩺
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <h1 className="font-bold text-sm tracking-tight truncate leading-tight">
                    {t.appName}
                  </h1>
                  <p className={`text-[11px] truncate ${textMuted}`}>{t.tagline}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: "check", label: t.navCheck, icon: "✏️", badge: null },
              {
                id: "saved",
                label: t.navSaved,
                icon: "📚",
                badge: stats.total > 0 ? stats.total : null,
              },
              {
                id: "practice",
                label: t.navPractice,
                icon: "🎯",
                badge: stats.needsPractice > 0 ? stats.needsPractice : null,
              },
              { id: "settings", label: t.navSettings, icon: "⚙️", badge: null },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    if (tab.id === "practice") setBugHuntMode(true);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                    active
                      ? isDark
                        ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                        : "bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-sm"
                      : isDark
                      ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                  title={tab.label}
                >
                  <span className="text-base shrink-0">{tab.icon}</span>
                  {!sidebarCollapsed && (
                    <span className="flex-1 text-left truncate">{tab.label}</span>
                  )}
                  {!sidebarCollapsed && tab.badge !== null && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        tab.id === "practice"
                          ? "bg-amber-500/20 text-amber-400"
                          : isDark
                          ? "bg-zinc-800 text-zinc-300"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Collapse & Quick User info */}
        <div className={`p-4 border-t ${borderTone} space-y-3`}>
          <button
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className={`w-full flex items-center justify-center gap-2 py-1.5 px-2 rounded-lg text-xs font-medium transition ${
              isDark ? "text-zinc-400 hover:bg-zinc-900" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <span>{sidebarCollapsed ? "➡️" : "⬅️"}</span>
            {!sidebarCollapsed && <span>{sidebarCollapsed ? t.expand : t.collapse}</span>}
          </button>

          {!sidebarCollapsed && (
            <div className="flex items-center gap-2.5 pt-1">
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                {user.email?.[0].toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate leading-tight">{user.email}</p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`text-[11px] underline hover:text-rose-400 ${textMuted}`}
                >
                  {t.signOut}
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top-Right Utility Bar */}
        <header
          className={`sticky top-0 z-20 shrink-0 flex items-center justify-between px-6 py-3.5 border-b backdrop-blur-md ${borderTone} ${
            isDark ? "bg-zinc-950/80" : "bg-white/80"
          }`}
        >
          {/* Active section breadcrumb */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-500">
              Lab
            </span>
            <span className={textMuted}>/</span>
            <h2 className="text-sm font-bold capitalize">
              {activeTab === "check"
                ? t.navCheck
                : activeTab === "saved"
                ? t.navSaved
                : activeTab === "practice"
                ? t.navPractice
                : t.navSettings}
            </h2>
          </div>

          {/* Quick utility controls without cramming */}
          <div className="flex items-center gap-3">
            {/* Quick Export Button */}
            <button
              type="button"
              onClick={handleExportMarkdown}
              disabled={autopsies.length === 0}
              className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border transition ${
                isDark
                  ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                  : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
              } disabled:opacity-30`}
              title="Export notes as Markdown"
            >
              <span>📄</span>
              <span>{t.exportNotes}</span>
            </button>

            {/* Language Switcher Dropdown */}
            <div className="relative">
              <select
                value={uiLang}
                onChange={(e) => setUiLang(e.target.value as UILanguage)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold outline-none transition cursor-pointer ${
                  isDark
                    ? "border-zinc-800 bg-zinc-900 text-zinc-200"
                    : "border-slate-200 bg-slate-100 text-slate-800"
                }`}
                aria-label="UI Language"
              >
                {UI_LANGUAGES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.flag} {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              className={`p-2 rounded-xl border text-sm transition ${
                isDark
                  ? "border-zinc-800 bg-zinc-900 text-amber-300 hover:bg-zinc-800"
                  : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              title={isDark ? t.themeLight : t.themeDark}
              aria-label="Toggle Theme"
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            {/* Account / Settings Trigger */}
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border transition ${
                activeTab === "settings"
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : isDark
                  ? "border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
                  : "border-slate-200 bg-slate-100 hover:bg-slate-200"
              }`}
              title={t.settingsTitle}
            >
              <div className="h-6 w-6 rounded-full bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center justify-center">
                {user.email?.[0].toUpperCase() || "U"}
              </div>
              <span className="text-xs font-medium hidden md:inline truncate max-w-[120px]">
                {user.email?.split("@")[0]}
              </span>
            </button>
          </div>
        </header>

        {/* Main Body with generous spacing and stacked cards */}
        <main className="flex-1 p-6 sm:p-10 max-w-5xl w-full mx-auto space-y-8">
          {/* Banner notification */}
          {banner && (
            <div
              className={`flex items-start justify-between gap-3 rounded-2xl border p-4 text-sm transition-all ${
                banner.type === "error"
                  ? "border-rose-500/30 bg-rose-950/20 text-rose-300"
                  : "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{banner.type === "error" ? "⚠️" : "✨"}</span>
                <span className="font-medium">{banner.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setBanner(null)}
                className="text-xs opacity-70 hover:opacity-100 underline ml-2"
              >
                {t.hide}
              </button>
            </div>
          )}

          {/* VIEW 1: Check Code (Primary input flow) */}
          {activeTab === "check" && (
            <div className="space-y-8">
              {/* Progress Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className={`rounded-2xl border p-4 ${bgCard}`}>
                  <p className={`text-xs font-medium ${textMuted}`}>{t.totalChecked}</p>
                  <p className="mt-1 text-2xl font-bold">{stats.total}</p>
                </div>
                <div className={`rounded-2xl border p-4 ${bgCard}`}>
                  <p className="text-xs font-medium text-amber-500">{t.stillLearning}</p>
                  <p className="mt-1 text-2xl font-bold text-amber-400">{stats.needsPractice}</p>
                </div>
                <div className={`rounded-2xl border p-4 ${bgCard}`}>
                  <p className="text-xs font-medium text-emerald-500">{t.gotIt}</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-400">{stats.mastered}</p>
                </div>
                <div className={`rounded-2xl border p-4 ${bgCard}`}>
                  <p className={`text-xs font-medium ${textMuted}`}>{t.commonIssue}</p>
                  <p className="mt-1 text-sm font-bold truncate text-cyan-400" title={stats.topBug}>
                    {stats.topBug}
                  </p>
                </div>
              </div>

              {/* Paste Broken Code Input Card */}
              <section className={`rounded-2xl border p-6 sm:p-8 shadow-sm ${bgCard}`}>
                <form onSubmit={handleRunAutopsy} className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight">{t.pasteTitle}</h3>
                      <p className={`text-sm mt-0.5 ${textMuted}`}>{t.pasteSub}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold outline-none cursor-pointer ${inputBg}`}
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={loadSampleBug}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                          isDark
                            ? "border-zinc-800 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800"
                            : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {t.tryExample}
                      </button>
                    </div>
                  </div>

                  {/* Code Textarea */}
                  <textarea
                    placeholder={t.codePlaceholder}
                    value={brokenCode}
                    onChange={(e) => setBrokenCode(e.target.value)}
                    rows={8}
                    required
                    className={`w-full rounded-xl border p-4 font-mono text-sm leading-relaxed outline-none transition ${inputBg}`}
                  />

                  {/* Optional Error Output */}
                  <div>
                    {!showErrorField && !errorOutput ? (
                      <button
                        type="button"
                        onClick={() => setShowErrorField(true)}
                        className="text-xs font-medium text-emerald-500 hover:underline flex items-center gap-1"
                      >
                        <span>{t.errorToggle}</span>
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className={`text-xs font-medium ${textMuted}`}>
                            {t.errorLabel}
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setShowErrorField(false);
                              setErrorOutput("");
                            }}
                            className={`text-xs hover:underline ${textMuted}`}
                          >
                            {t.hide}
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder={t.errorPlaceholder}
                          value={errorOutput}
                          onChange={(e) => setErrorOutput(e.target.value)}
                          className={`w-full rounded-xl border px-4 py-2.5 font-mono text-sm text-rose-400 outline-none ${inputBg}`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Check My Code Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isAnalyzing || !brokenCode.trim()}
                      className="w-full sm:w-auto rounded-xl bg-emerald-500 px-8 py-3.5 text-base font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-40"
                    >
                      {isAnalyzing ? t.checkingButton : `🔍 ${t.checkButton}`}
                    </button>
                  </div>
                </form>
              </section>

              {/* Quick links to Saved Fixes if any exist */}
              {autopsies.length > 0 && (
                <div className="pt-4 flex items-center justify-between">
                  <p className={`text-xs uppercase tracking-wider font-bold ${textMuted}`}>
                    {t.navSaved} ({autopsies.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("saved")}
                    className="text-xs font-semibold text-emerald-500 hover:underline"
                  >
                    View All Saved Fixes →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2 & VIEW 3: Saved Fixes & Practice Game */}
          {(activeTab === "saved" || activeTab === "practice") && (
            <div className="space-y-6">
              {/* Practice Game Banner (When on Practice tab) */}
              {activeTab === "practice" && (
                <div
                  className={`rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isDark
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                      : "border-amber-300 bg-amber-50 text-amber-900"
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <span>🎯</span>
                      <span>{t.practiceChallenge}</span>
                    </h3>
                    <p className="text-xs mt-1 opacity-90">{t.practiceSub}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuizRandomBug}
                    disabled={stats.needsPractice === 0}
                    className="rounded-xl bg-amber-400 text-zinc-950 px-4 py-2 text-xs font-bold shadow hover:bg-amber-300 disabled:opacity-40 whitespace-nowrap"
                  >
                    {t.quizStillLearning} ({stats.needsPractice})
                  </button>
                </div>
              )}

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Status Tabs */}
                <div
                  className={`flex items-center gap-1 rounded-xl p-1 border self-start ${
                    isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
                  }`}
                >
                  {(
                    [
                      { label: t.filterAll, value: "All" },
                      { label: t.filterStillLearning, value: "Needs Practice" },
                      { label: t.filterGotIt, value: "Mastered" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setStatusFilter(tab.value)}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                        statusFilter === tab.value
                          ? isDark
                            ? "bg-zinc-800 text-white shadow-sm"
                            : "bg-emerald-500 text-white shadow-sm"
                          : textMuted
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search & Extra Filters Button */}
                <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2 text-sm outline-none ${inputBg}`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowAdvancedFilters((prev) => !prev)}
                    className={`rounded-xl border px-3 py-2 text-xs font-medium transition whitespace-nowrap ${
                      showAdvancedFilters || languageFilter !== "All" || categoryFilter !== "All"
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                        : isDark
                        ? "border-zinc-800 bg-zinc-900 text-zinc-400"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {t.filters}
                  </button>
                </div>
              </div>

              {/* Advanced Filter Row */}
              {showAdvancedFilters && (
                <div className={`flex flex-wrap gap-4 rounded-xl border p-4 ${bgCard}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${textMuted}`}>{t.language}:</span>
                    <select
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                      className={`rounded-lg border px-2.5 py-1 text-xs outline-none ${inputBg}`}
                    >
                      {availableLanguages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang === "All" ? t.filterAll : lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${textMuted}`}>{t.category}:</span>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className={`rounded-lg border px-2.5 py-1 text-xs outline-none ${inputBg}`}
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === "All" ? t.filterAll : cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(languageFilter !== "All" || categoryFilter !== "All") && (
                    <button
                      type="button"
                      onClick={() => {
                        setLanguageFilter("All");
                        setCategoryFilter("All");
                      }}
                      className="text-xs text-emerald-500 hover:underline"
                    >
                      {t.resetFilters}
                    </button>
                  )}
                </div>
              )}

              {/* Cards List */}
              <div className="space-y-6">
                {dataLoading ? (
                  <div className={`text-center py-12 text-sm ${textMuted}`}>{t.loadingBugs}</div>
                ) : filteredAutopsies.length === 0 ? (
                  <div className={`rounded-2xl border border-dashed p-12 text-center ${borderTone}`}>
                    <span className="text-3xl block mb-2">🔍</span>
                    <p className="text-base font-semibold">{t.noBugsTitle}</p>
                    <p className={`text-sm mt-1 max-w-sm mx-auto ${textMuted}`}>{t.noBugsSub}</p>
                  </div>
                ) : (
                  filteredAutopsies.map((item) => {
                    const isGameCard =
                      (activeTab === "practice" || bugHuntMode) && !revealedAnswers[item.id];
                    const isHighlighted = highlightedId === item.id;
                    const isMastered = item.status === "Mastered";

                    return (
                      <article
                        key={item.id}
                        className={`rounded-2xl border p-6 sm:p-7 transition-all ${bgCard} ${
                          isHighlighted ? "border-emerald-500 ring-1 ring-emerald-500/50" : ""
                        }`}
                      >
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h4 className="text-lg font-bold tracking-tight">{item.title}</h4>
                            <span
                              className={`rounded-lg px-2.5 py-0.5 text-xs font-semibold ${
                                isDark
                                  ? "bg-zinc-800 text-zinc-300"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {item.language}
                            </span>
                            <span
                              className={`rounded-lg border px-2.5 py-0.5 text-xs ${
                                isDark
                                  ? "border-zinc-700/60 bg-zinc-800/40 text-zinc-400"
                                  : "border-slate-200 bg-slate-50 text-slate-500"
                              }`}
                            >
                              {item.bug_category}
                            </span>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold border ${
                              isMastered
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {isMastered ? t.gotIt : t.stillLearning}
                          </span>
                        </div>

                        {/* Practice Mode view for this card */}
                        {isGameCard ? (
                          <div
                            className={`mt-5 rounded-xl border p-5 space-y-4 ${
                              isDark
                                ? "border-amber-500/30 bg-zinc-950"
                                : "border-amber-200 bg-amber-50/50"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="text-xs font-bold uppercase tracking-wider text-amber-500">
                                {t.practiceChallenge}
                              </p>

                              <div className="flex items-center gap-2">
                                {item.challenge_hint && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRevealedHints((prev) => ({
                                        ...prev,
                                        [item.id]: !prev[item.id],
                                      }))
                                    }
                                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                                      isDark
                                        ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                        : "border-slate-300 text-slate-700 hover:bg-white"
                                    }`}
                                  >
                                    {revealedHints[item.id] ? t.hideHint : t.showHint}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRevealedAnswers((prev) => ({ ...prev, [item.id]: true }))
                                  }
                                  className="rounded-lg bg-amber-400 text-zinc-950 px-3.5 py-1.5 text-xs font-bold hover:bg-amber-300"
                                >
                                  {t.revealSolution}
                                </button>
                              </div>
                            </div>

                            {revealedHints[item.id] && item.challenge_hint && (
                              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-300">
                                💡 <strong>{t.hintLabel}</strong> {item.challenge_hint}
                              </div>
                            )}

                            <pre
                              className={`overflow-x-auto rounded-xl border p-4 font-mono text-xs leading-relaxed ${
                                isDark
                                  ? "bg-zinc-900 border-zinc-800 text-zinc-200"
                                  : "bg-slate-900 border-slate-800 text-slate-200"
                              }`}
                            >
                              <code>{item.challenge_code || item.broken_code}</code>
                            </pre>
                          </div>
                        ) : (
                          /* Normal Autopsy Details */
                          <div className="mt-5 space-y-5">
                            {/* What Went Wrong Callout */}
                            <div className={`rounded-xl border p-4 sm:p-5 ${bgSubCard}`}>
                              <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                                {t.whatWentWrong}
                              </p>
                              <p className="mt-2 text-base leading-relaxed font-normal">
                                {item.diagnosis}
                              </p>
                              {item.error_output && (
                                <div className="mt-3 rounded-lg border border-rose-500/20 bg-rose-950/20 px-3 py-2 font-mono text-xs text-rose-400">
                                  {item.error_output}
                                </div>
                              )}
                            </div>

                            {/* Side-by-side Broken vs Fixed Code */}
                            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                              {/* Broken Code Box */}
                              <div
                                className={`rounded-xl border border-rose-500/30 p-4 ${
                                  isDark ? "bg-zinc-950" : "bg-slate-900"
                                }`}
                              >
                                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block mb-2">
                                  {t.brokenCode}
                                </span>
                                <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-zinc-200">
                                  <code>{item.broken_code}</code>
                                </pre>
                              </div>

                              {/* Fixed Code Box */}
                              <div
                                className={`rounded-xl border border-emerald-500/30 p-4 ${
                                  isDark ? "bg-zinc-950" : "bg-slate-900"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                                    {t.fixedCode}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyCode(item.id, item.fixed_code)}
                                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
                                  >
                                    {copiedId === item.id ? t.copied : t.copyFix}
                                  </button>
                                </div>
                                <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-emerald-300">
                                  <code>{item.fixed_code}</code>
                                </pre>
                              </div>
                            </div>

                            {/* Walkthrough */}
                            {item.walkthrough && (
                              <div className={`rounded-xl border p-4 ${bgSubCard}`}>
                                <p className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>
                                  {t.explanation}
                                </p>
                                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
                                  {item.walkthrough}
                                </p>
                              </div>
                            )}

                            {/* Optional Practice Puzzle */}
                            {item.challenge_code && (
                              <details className={`rounded-xl border p-3.5 ${bgSubCard}`}>
                                <summary className="cursor-pointer text-xs font-semibold text-amber-500 hover:underline">
                                  {t.testYourself}
                                </summary>
                                <div className="mt-3 space-y-2">
                                  {item.challenge_hint && (
                                    <p className={`text-xs ${textMuted}`}>
                                      {t.hintLabel} {item.challenge_hint}
                                    </p>
                                  )}
                                  <pre
                                    className={`overflow-x-auto rounded-lg border p-3 font-mono text-xs ${
                                      isDark
                                        ? "bg-zinc-900 border-zinc-800 text-zinc-200"
                                        : "bg-slate-900 border-slate-800 text-slate-200"
                                    }`}
                                  >
                                    <code>{item.challenge_code}</code>
                                  </pre>
                                </div>
                              </details>
                            )}
                          </div>
                        )}

                        {/* Bottom Actions */}
                        <div
                          className={`mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4 ${borderTone}`}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                              isMastered
                                ? isDark
                                  ? "border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                  : "border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
                                : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                            }`}
                          >
                            {isMastered ? t.markStillLearning : t.markGotIt}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="rounded-xl border border-transparent px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition"
                          >
                            {t.delete}
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* VIEW 4: Dedicated Settings View */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">{t.settingsTitle}</h3>
                <p className={`text-sm mt-1 ${textMuted}`}>{t.settingsSub}</p>
              </div>

              {/* Theme Preference Card */}
              <section className={`rounded-2xl border p-6 space-y-4 ${bgCard}`}>
                <h4 className="text-sm font-bold uppercase tracking-wider">{t.appearance}</h4>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border text-sm font-bold transition ${
                      theme === "dark"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
                        : isDark
                        ? "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
                        : "border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>🌙</span>
                    <span>{t.themeDark}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border text-sm font-bold transition ${
                      theme === "light"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/30"
                        : isDark
                        ? "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
                        : "border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>☀️</span>
                    <span>{t.themeLight}</span>
                  </button>
                </div>
              </section>

              {/* UI Language Selector Card */}
              <section className={`rounded-2xl border p-6 space-y-4 ${bgCard}`}>
                <h4 className="text-sm font-bold uppercase tracking-wider">{t.uiLanguage}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {UI_LANGUAGES.map((langItem) => {
                    const isSelected = uiLang === langItem.code;
                    return (
                      <button
                        key={langItem.code}
                        type="button"
                        onClick={() => setUiLang(langItem.code)}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
                            : isDark
                            ? "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-2xl">{langItem.flag}</span>
                        <span>{langItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Account Card */}
              <section className={`rounded-2xl border p-6 space-y-4 ${bgCard}`}>
                <h4 className="text-sm font-bold uppercase tracking-wider">{t.account}</h4>
                <div className="space-y-3">
                  <div className={`p-4 rounded-xl border ${bgSubCard}`}>
                    <p className={`text-xs ${textMuted}`}>{t.signedInAs}</p>
                    <p className="text-sm font-bold mt-0.5">{user.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-4 rounded-xl border ${bgSubCard}`}>
                      <p className={`text-xs ${textMuted}`}>{t.totalAutopsies}</p>
                      <p className="text-xl font-bold mt-0.5">{stats.total}</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${bgSubCard}`}>
                      <p className={`text-xs ${textMuted}`}>{t.masteredCount}</p>
                      <p className="text-xl font-bold mt-0.5 text-emerald-500">{stats.mastered}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Danger Zone / Log Out Card */}
              <section className={`rounded-2xl border border-rose-500/20 p-6 space-y-4 ${bgCard}`}>
                <h4 className="text-sm font-bold uppercase tracking-wider text-rose-400">
                  {t.dangerZone}
                </h4>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">{t.logOutButton}</p>
                    <p className={`text-xs mt-0.5 ${textMuted}`}>
                      End your session on this device.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-5 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition active:scale-[0.99]"
                  >
                    {t.logOutButton}
                  </button>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
