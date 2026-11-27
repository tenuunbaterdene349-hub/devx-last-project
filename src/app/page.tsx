"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  Code2,
  BookmarkCheck,
  Target,
  Trophy,
  Flame,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Download,
  Search,
  SlidersHorizontal,
  Check,
  RotateCcw,
  Trash2,
  Copy,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Sparkles,
  Play,
  Plus,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  LogOut,
  Terminal,
  ArrowRight,
} from "lucide-react";

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

type UserProfile = {
  id: string;
  display_name: string;
  points: number;
  weekly_points: number;
  current_streak: number;
  longest_streak: number;
  mastered_count: number;
  last_active_date: string | null;
  created_at?: string;
  updated_at?: string;
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

const UI_LANGUAGES: { code: UILanguage; label: string }[] = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "mn", label: "Монгол" },
];

const TRANSLATIONS: Record<
  UILanguage,
  {
    appName: string;
    tagline: string;
    navCheck: string;
    navSaved: string;
    navPractice: string;
    navLeaderboard: string;
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
    spotBug: string;
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
    leaderboardTitle: string;
    leaderboardSub: string;
    thisWeek: string;
    allTime: string;
    rankCol: string;
    devCol: string;
    streakCol: string;
    masteredCol: string;
    pointsCol: string;
    youBadge: string;
    yourRankLabel: string;
    noLeaderboardTitle: string;
    noLeaderboardSub: string;
    streakStatLabel: string;
    pointsStatLabel: string;
  }
> = {
  en: {
    appName: "Bug Autopsy Lab",
    tagline: "Code mistake analyzer",
    navCheck: "Check Code",
    navSaved: "Saved Fixes",
    navPractice: "Practice Game",
    navLeaderboard: "Leaderboard",
    collapse: "Collapse",
    expand: "Expand",
    totalChecked: "Total Checked",
    stillLearning: "Still Learning",
    gotIt: "Got It!",
    commonIssue: "Common Issue",
    noneYet: "None yet",
    pasteTitle: "Paste Broken Code",
    pasteSub: "Choose your language, paste what is failing, and inspect the root cause.",
    language: "Language",
    tryExample: "Try an Example",
    codePlaceholder: "Paste the code you want to inspect...",
    errorToggle: "Did you get an error message? (Optional)",
    errorLabel: "Error message or traceback (Optional)",
    hide: "Hide",
    errorPlaceholder: "e.g. IndexError: list index out of range",
    checkButton: "Check My Code",
    checkingButton: "Diagnosing Code...",
    filterAll: "All",
    filterStillLearning: "Still Learning",
    filterGotIt: "Got It!",
    searchPlaceholder: "Search saved fixes...",
    filters: "Filters",
    resetFilters: "Reset filters",
    category: "Category",
    loadingBugs: "Loading your bugs...",
    noBugsTitle: "No bugs to show",
    noBugsSub: "Paste broken code above to generate your first autopsy.",
    whatWentWrong: "What Went Wrong",
    howToFix: "How to Fix It",
    brokenCode: "Broken Code",
    fixedCode: "How to Fix It",
    explanation: "Explanation of the Fix",
    copyFix: "Copy Fix",
    copied: "Copied!",
    markGotIt: "Mark as Got It!",
    markStillLearning: "Mark as Still Learning",
    delete: "Delete",
    deleteConfirm: "Are you sure you want to remove this bug?",
    practiceChallenge: "Practice Challenge",
    practiceSub: "Can you spot the mistake in this code before seeing the fix?",
    showHint: "Show Hint",
    hideHint: "Hide Hint",
    hintLabel: "Hint:",
    revealSolution: "Reveal Solution",
    spotBug: "I Spotted the Mistake (+15 pts)",
    quizStillLearning: "Quiz Still Learning",
    testYourself: "Test yourself: Spot this bug in another puzzle",
    exportNotes: "Export Notes (.md)",
    signOut: "Sign Out",
    settingsTitle: "Settings",
    settingsSub: "Personalize your learning experience and manage your account.",
    appearance: "Appearance",
    themeDark: "Dark",
    themeLight: "Light",
    uiLanguage: "Language",
    account: "Account Information",
    signedInAs: "Signed in as",
    totalAutopsies: "Total Saved Autopsies",
    masteredCount: "Mastered Fixes",
    dangerZone: "Account Actions",
    logOutButton: "Sign Out",
    welcomeTitle: "Bug Autopsy Lab",
    welcomeSub: "Paste broken code. See what went wrong. Master the fix.",
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
    leaderboardTitle: "Global Leaderboard",
    leaderboardSub: "Top developer diagnostic streaks and rankings.",
    thisWeek: "This Week",
    allTime: "All-Time",
    rankCol: "Rank",
    devCol: "Developer",
    streakCol: "Streak",
    masteredCol: "Mastered",
    pointsCol: "Points",
    youBadge: "You",
    yourRankLabel: "Your Standing",
    noLeaderboardTitle: "No developers ranked yet",
    noLeaderboardSub: "Complete autopsies and practice drills to claim the #1 spot.",
    streakStatLabel: "Daily Streak",
    pointsStatLabel: "Points",
  },
  zh: {
    appName: "代码验尸实验室",
    tagline: "代码错误分析器",
    navCheck: "检查代码",
    navSaved: "已保存修复",
    navPractice: "练习游戏",
    navLeaderboard: "排行榜",
    collapse: "收起",
    expand: "展开",
    totalChecked: "已检查总数",
    stillLearning: "仍在学习",
    gotIt: "我懂了！",
    commonIssue: "常见问题",
    noneYet: "暂无",
    pasteTitle: "粘贴出错的代码",
    pasteSub: "选择编程语言，粘贴未正常运行的代码，然后点击检查代码。",
    language: "编程语言",
    tryExample: "试用示例",
    codePlaceholder: "在此粘贴需要检查的代码...",
    errorToggle: "有报错信息吗？（可选）",
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
    brokenCode: "出错的代码",
    fixedCode: "修复后的代码",
    explanation: "修复原理解析",
    copyFix: "复制修复代码",
    copied: "已复制！",
    markGotIt: "标记为已掌握",
    markStillLearning: "标记为仍在学习",
    delete: "删除",
    deleteConfirm: "确定要删除这条错误记录吗？",
    practiceChallenge: "练习挑战",
    practiceSub: "在查看答案之前，你能找出这段代码中的错误吗？",
    showHint: "查看提示",
    hideHint: "隐藏提示",
    hintLabel: "提示：",
    revealSolution: "查看答案与修复",
    spotBug: "我找出错误了 (+15 分)",
    quizStillLearning: "抽查未掌握的代码",
    testYourself: "自我测试：在另一个谜题中找出类似错误",
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
    welcomeTitle: "代码验尸实验室",
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
    leaderboardTitle: "全球开发者排行榜",
    leaderboardSub: "诊断排位与连续刷题天数排行榜。",
    thisWeek: "本周",
    allTime: "总榜",
    rankCol: "排名",
    devCol: "开发者",
    streakCol: "连续天数",
    masteredCol: "已掌握",
    pointsCol: "积分",
    youBadge: "你",
    yourRankLabel: "你的当前排名",
    noLeaderboardTitle: "暂无排行榜记录",
    noLeaderboardSub: "完成代码诊断或练习挑战即可抢占第一名。",
    streakStatLabel: "连续学习",
    pointsStatLabel: "开发者积分",
  },
  es: {
    appName: "Laboratorio de Autopsia de Errores",
    tagline: "Analizador de errores",
    navCheck: "Revisar Código",
    navSaved: "Arreglos Guardados",
    navPractice: "Juego de Práctica",
    navLeaderboard: "Clasificación",
    collapse: "Contraer",
    expand: "Expandir",
    totalChecked: "Total Revisados",
    stillLearning: "Aprendiendo",
    gotIt: "¡Entendido!",
    commonIssue: "Problema Común",
    noneYet: "Ninguno aún",
    pasteTitle: "Pega el Código Roto",
    pasteSub: "Elige tu lenguaje, pega lo que no funcione y diagnostica la causa raíz.",
    language: "Lenguaje",
    tryExample: "Probar un Ejemplo",
    codePlaceholder: "Pega aquí el código que quieres revisar...",
    errorToggle: "¿Tuviste algún mensaje de error? (Opcional)",
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
    brokenCode: "Código con Error",
    fixedCode: "Cómo Debe Quedar",
    explanation: "Explicación de la Solución",
    copyFix: "Copiar Arreglo",
    copied: "¡Copiado!",
    markGotIt: "Marcar como Entendido",
    markStillLearning: "Marcar como Aprendiendo",
    delete: "Eliminar",
    deleteConfirm: "¿Estás seguro de que deseas eliminar este error?",
    practiceChallenge: "Desafío de Práctica",
    practiceSub: "¿Puedes detectar el error antes de ver la solución?",
    showHint: "Ver Pista",
    hideHint: "Ocultar Pista",
    hintLabel: "Pista:",
    revealSolution: "Revelar Solución",
    spotBug: "Detecté el Error (+15 pts)",
    quizStillLearning: "Cuestionario de Aprendizaje",
    testYourself: "Ponte a prueba: Detecta este error en otro acertijo",
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
    leaderboardTitle: "Clasificación Global",
    leaderboardSub: "Rachas de depuración y puntuaciones de desarrolladores.",
    thisWeek: "Esta Semana",
    allTime: "Histórico",
    rankCol: "Posición",
    devCol: "Desarrollador",
    streakCol: "Racha",
    masteredCol: "Dominados",
    pointsCol: "Puntos",
    youBadge: "Tú",
    yourRankLabel: "Tu Clasificación",
    noLeaderboardTitle: "Aún no hay desarrolladores clasificados",
    noLeaderboardSub: "Completa autopsias y ejercicios para alcanzar el primer puesto.",
    streakStatLabel: "Racha Diaria",
    pointsStatLabel: "Puntos",
  },
  fr: {
    appName: "Laboratoire d'Autopsie de Bugs",
    tagline: "Analyseur d'erreurs",
    navCheck: "Vérifier le Code",
    navSaved: "Corrections Sauvegardées",
    navPractice: "Jeu d'Entraînement",
    navLeaderboard: "Classement",
    collapse: "Réduire",
    expand: "Agrandir",
    totalChecked: "Total Vérifiés",
    stillLearning: "En apprentissage",
    gotIt: "Compris !",
    commonIssue: "Problème Fréquent",
    noneYet: "Aucun pour l'instant",
    pasteTitle: "Collez le Code Défaillant",
    pasteSub: "Choisissez votre langage, collez votre code et comprenez l'erreur.",
    language: "Langage",
    tryExample: "Essayer un Exemple",
    codePlaceholder: "Collez ici le code à inspecter...",
    errorToggle: "Avez-vous eu un message d'erreur ? (Optionnel)",
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
    brokenCode: "Code Défaillant",
    fixedCode: "Code Corrigé",
    explanation: "Explication de la Correction",
    copyFix: "Copier le Code",
    copied: "Copié !",
    markGotIt: "Marquer comme Compris",
    markStillLearning: "Marquer en Apprentissage",
    delete: "Supprimer",
    deleteConfirm: "Voulez-vous vraiment supprimer ce bug ?",
    practiceChallenge: "Défi d'Entraînement",
    practiceSub: "Pouvez-vous repérer l'erreur avant de regarder la solution ?",
    showHint: "Voir l'Indice",
    hideHint: "Masquer l'Indice",
    hintLabel: "Indice :",
    revealSolution: "Révéler la Solution",
    spotBug: "J'ai trouvé l'erreur (+15 pts)",
    quizStillLearning: "Quiz des Non Maîtrisés",
    testYourself: "Testez-vous : repérez ce bug dans une autre énigme",
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
    leaderboardTitle: "Classement Général",
    leaderboardSub: "Séries de débogage et scores des développeurs.",
    thisWeek: "Cette Semaine",
    allTime: "Tout Temps",
    rankCol: "Rang",
    devCol: "Développeur",
    streakCol: "Série",
    masteredCol: "Maîtrisés",
    pointsCol: "Points",
    youBadge: "Vous",
    yourRankLabel: "Votre Position",
    noLeaderboardTitle: "Aucun développeur classé",
    noLeaderboardSub: "Analysez du code et réussissez des défis pour être numéro 1.",
    streakStatLabel: "Série Quotidienne",
    pointsStatLabel: "Points",
  },
  mn: {
    appName: "Кодын Алдаа Шинжлэх Лаборатори",
    tagline: "Кодын алдаа шинжлэгч",
    navCheck: "Код Шалгах",
    navSaved: "Хадгалсан Засварууд",
    navPractice: "Дадлага Тоглоом",
    navLeaderboard: "Тэргүүлэгчид",
    collapse: "Хураах",
    expand: "Дэлгэх",
    totalChecked: "Нийт Шалгасан",
    stillLearning: "Суралцаж байна",
    gotIt: "Ойлголоо!",
    commonIssue: "Түгээмэл Алдаа",
    noneYet: "Одоогоор алга",
    pasteTitle: "Алдаатай Кодоо Энд Буулгана Уу",
    pasteSub: "Програмчлалын хэлээ сонгоод, ажиллахгүй байгаа кодоо оруулж шалгана уу.",
    language: "Хэл",
    tryExample: "Жишээ Үзэх",
    codePlaceholder: "Шалгуулах кодоо энд буулгана уу...",
    errorToggle: "Алдааны мэдээлэл гарсан уу? (Заавал биш)",
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
    brokenCode: "Алдаатай Код",
    fixedCode: "Зөв Зассан Код",
    explanation: "Засварын Тайлбар",
    copyFix: "Засварыг Хуулах",
    copied: "Хуулагдлаа!",
    markGotIt: "Ойлголоо гэж тэмдэглэх",
    markStillLearning: "Дахин суралцах гэж тэмдэглэх",
    delete: "Устгах",
    deleteConfirm: "Энэ алдааны тэмдэглэлийг устгахдаа итгэлтэй байна уу?",
    practiceChallenge: "Дадлагын Сорил",
    practiceSub: "Зөв хариуг харахаасаа өмнө энэ кодын алдааг олж чадах уу?",
    showHint: "Зөвлөмж Харах",
    hideHint: "Зөвлөмж Нуух",
    hintLabel: "Зөвлөмж:",
    revealSolution: "Шийдлийг Харах",
    spotBug: "Би алдааг оллоо (+15 оноо)",
    quizStillLearning: "Суралцаж буйг шалгах",
    testYourself: "Өөрийгөө сорь: Үүнтэй төстэй оньсогоноос алдааг ол",
    exportNotes: "Тэмдэглэл татах (.md)",
    signOut: "Гарах",
    settingsTitle: "Тохиргоо",
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
    leaderboardTitle: "Хөгжүүлэгчдийн Тэргүүлэгчдийн Самбар",
    leaderboardSub: "Өдөр тутмын цуврал болон нийт онооны жагсаалт.",
    thisWeek: "Энэ 7 хоног",
    allTime: "Бүх цаг үе",
    rankCol: "Байр",
    devCol: "Хөгжүүлэгч",
    streakCol: "Цуврал",
    masteredCol: "Эзэмшсэн",
    pointsCol: "Оноо",
    youBadge: "Та",
    yourRankLabel: "Таны байр суурь",
    noLeaderboardTitle: "Жагсаалт хоосон байна",
    noLeaderboardSub: "Алдаа шинжилж, дасгал ажиллан тэргүүн байрын төлөө өрсөлдөөрэй.",
    streakStatLabel: "Өдрийн Цуврал",
    pointsStatLabel: "Нийт Оноо",
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

function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatPostgresDate(dateVal: string | null | undefined): string | null {
  if (!dateVal) return null;
  const str = String(dateVal).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDaysDifference(d1: string, d2: string): number {
  const date1 = new Date(d1 + "T00:00:00");
  const date2 = new Date(d2 + "T00:00:00");
  const diffTime = date2.getTime() - date1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Profile, Streak & Points state
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Authentication form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  // Appearance & Localization settings
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [uiLang, setUiLang] = useState<UILanguage>("en");
  const [activeTab, setActiveTab] = useState<"check" | "saved" | "practice" | "leaderboard">("check");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
  const [solvedDrills, setSolvedDrills] = useState<Record<string, boolean>>({});
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"week" | "all">("all");

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

  // Load user profile safely with automatic fallback upsert
  async function loadUserProfile(userId: string, emailStr?: string) {
    try {
      const defaultName = emailStr ? emailStr.split("@")[0] : "Developer";

      const { data, error, status, statusText } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        const errStr = JSON.stringify(error, Object.getOwnPropertyNames(error));
        console.error("Supabase loadUserProfile select error:", {
          status,
          statusText,
          error: errStr,
        });
        setBanner({
          type: "error",
          text: `Profile query error [HTTP ${status}]: ${error.message || errStr}`,
        });
      }

      if (data) {
        const loaded = data as UserProfile;
        setProfile(loaded);
        if (!loaded.display_name || loaded.display_name === "Developer") {
          if (defaultName !== loaded.display_name) {
            const { error: updateErr, status: updStatus, statusText: updStatusText } = await supabase
              .from("profiles")
              .update({ display_name: defaultName })
              .eq("id", userId);
            if (updateErr) {
              const errStr = JSON.stringify(updateErr, Object.getOwnPropertyNames(updateErr));
              console.error("Supabase loadUserProfile update error:", {
                status: updStatus,
                statusText: updStatusText,
                error: errStr,
              });
            } else {
              setProfile((prev) => (prev ? { ...prev, display_name: defaultName } : null));
            }
          }
        }
      } else {
        const fallback: UserProfile = {
          id: userId,
          display_name: defaultName,
          points: 0,
          weekly_points: 0,
          current_streak: 0,
          longest_streak: 0,
          mastered_count: 0,
          last_active_date: null,
        };
        const { data: created, error: upsertErr, status: upStatus, statusText: upStatusText } = await supabase
          .from("profiles")
          .upsert(
            {
              id: userId,
              display_name: defaultName,
              points: 0,
              weekly_points: 0,
              current_streak: 0,
              longest_streak: 0,
              mastered_count: 0,
              last_active_date: null,
            },
            { onConflict: "id" }
          )
          .select()
          .maybeSingle();

        if (upsertErr) {
          const errStr = JSON.stringify(upsertErr, Object.getOwnPropertyNames(upsertErr));
          console.error("Supabase loadUserProfile upsert error:", {
            status: upStatus,
            statusText: upStatusText,
            error: errStr,
          });
          setBanner({
            type: "error",
            text: `Failed to save profile [HTTP ${upStatus}]: ${upsertErr.message || errStr}`,
          });
        }

        if (created) {
          setProfile(created as UserProfile);
        } else {
          setProfile(fallback);
        }
      }
    } catch (err) {
      console.error("Profile load unexpected exception:", err);
    }
  }

  // Load global leaderboard
  const loadLeaderboard = useCallback(async (period: "week" | "all" = "all") => {
    setLeaderboardLoading(true);
    try {
      const sortField = period === "week" ? "weekly_points" : "points";
      const { data, error, status, statusText } = await supabase
        .from("profiles")
        .select("*")
        .order(sortField, { ascending: false });

      if (error) {
        const errStr = JSON.stringify(error, Object.getOwnPropertyNames(error));
        console.error("Supabase loadLeaderboard error:", {
          status,
          statusText,
          error: errStr,
        });
        setBanner({
          type: "error",
          text: `Leaderboard query error [HTTP ${status}]: ${error.message || errStr}`,
        });
      } else if (data) {
        setLeaderboard(data as UserProfile[]);
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  // Core streak tracking & points calculation engine
  async function recordUserActivity(
    actionType: "autopsy_logged" | "mastered_fix" | "practice_win"
  ): Promise<{ pointsAwarded: number; streakBonus: boolean; currentStreak: number }> {
    if (!user) return { pointsAwarded: 0, streakBonus: false, currentStreak: 0 };

    const today = getLocalDateString();
    const currentProfile: UserProfile = profile || {
      id: user.id,
      display_name: user.email?.split("@")[0] || "Developer",
      points: 0,
      weekly_points: 0,
      current_streak: 0,
      longest_streak: 0,
      mastered_count: 0,
      last_active_date: null,
    };

    // 1. Base points
    let basePoints = 0;
    if (actionType === "autopsy_logged") basePoints = 10;
    else if (actionType === "mastered_fix") basePoints = 25;
    else if (actionType === "practice_win") basePoints = 15;

    // 2. Consecutive day streak check
    let nextCurrentStreak = currentProfile.current_streak;
    let nextLongestStreak = currentProfile.longest_streak;
    let streakBonus = 0;

    if (!currentProfile.last_active_date) {
      // First day ever active!
      nextCurrentStreak = 1;
      nextLongestStreak = Math.max(nextLongestStreak, 1);
      streakBonus = 10; // +10 daily streak bonus
    } else if (currentProfile.last_active_date === today) {
      // Already active today: keep current streak, no additional daily streak bonus today
      nextCurrentStreak = currentProfile.current_streak || 1;
      streakBonus = 0;
    } else {
      const diff = getDaysDifference(currentProfile.last_active_date, today);
      if (diff === 1) {
        // Active on consecutive calendar day: increment streak & award bonus
        nextCurrentStreak = (currentProfile.current_streak || 0) + 1;
        nextLongestStreak = Math.max(nextLongestStreak, nextCurrentStreak);
        streakBonus = 10;
      } else {
        // Missed one or more days: reset streak cleanly to 1
        nextCurrentStreak = 1;
        streakBonus = 0;
      }
    }

    const totalAwarded = basePoints + streakBonus;
    const newPoints = (currentProfile.points || 0) + totalAwarded;
    const newWeeklyPoints = (currentProfile.weekly_points || 0) + totalAwarded;
    const newMasteredCount =
      actionType === "mastered_fix"
        ? (currentProfile.mastered_count || 0) + 1
        : currentProfile.mastered_count || 0;

    const updatedProfile: UserProfile = {
      ...currentProfile,
      points: newPoints,
      weekly_points: newWeeklyPoints,
      current_streak: nextCurrentStreak,
      longest_streak: nextLongestStreak,
      mastered_count: newMasteredCount,
      last_active_date: today,
      updated_at: new Date().toISOString(),
    };

    setProfile(updatedProfile);

    // Persist to Supabase profiles
    try {
      const upsertPayload = {
        id: user.id,
        display_name: updatedProfile.display_name,
        points: newPoints,
        weekly_points: newWeeklyPoints,
        current_streak: nextCurrentStreak,
        longest_streak: nextLongestStreak,
        mastered_count: newMasteredCount,
        last_active_date: formatPostgresDate(today),
      };

      const { error: upsertErr, status, statusText } = await supabase
        .from("profiles")
        .upsert(upsertPayload, { onConflict: "id" });

      if (upsertErr) {
        const errStr = JSON.stringify(upsertErr, Object.getOwnPropertyNames(upsertErr));
        console.error("Supabase recordUserActivity upsert error:", {
          status,
          statusText,
          error: errStr,
        });
        setBanner({
          type: "error",
          text: `Failed to save points to database [HTTP ${status}]: ${upsertErr.message || errStr}`,
        });
      }
    } catch (err) {
      console.error("recordUserActivity unexpected exception:", err);
      setBanner({
        type: "error",
        text: "Unexpected network error saving profile.",
      });
    }

    loadLeaderboard(leaderboardPeriod);

    return {
      pointsAwarded: totalAwarded,
      streakBonus: streakBonus > 0,
      currentStreak: nextCurrentStreak,
    };
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const initialUser = data.session?.user ?? null;
      setUser(initialUser);
      setAuthLoading(false);
      if (initialUser) {
        loadUserAutopsies(initialUser.id);
        loadUserProfile(initialUser.id, initialUser.email);
      }
      loadLeaderboard("all");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        loadUserAutopsies(nextUser.id);
        loadUserProfile(nextUser.id, nextUser.email);
        loadLeaderboard("all");
      } else {
        setAutopsies([]);
        setProfile(null);
        loadLeaderboard("all");
      }
    });

    return () => subscription.unsubscribe();
  }, [loadLeaderboard]);

  // Authentication submission

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

        // Award points if code is meaningful (minimum 20 characters to prevent empty gaming)
        if (brokenCode.trim().length >= 20) {
          const actResult = await recordUserActivity("autopsy_logged");
          const bonusText = actResult.streakBonus
            ? ` (+10 pts Streak Bonus! ${actResult.currentStreak}d streak)`
            : "";
          setBanner({
            type: "success",
            text: `${t.autopsyComplete} "${created.title}". +${actResult.pointsAwarded} pts${bonusText}`,
          });
        } else {
          setBanner({
            type: "success",
            text: `${t.autopsyComplete} "${created.title}".`,
          });
        }
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

      if (nextStatus === "Mastered") {
        // Award points for mastering fix
        const actResult = await recordUserActivity("mastered_fix");
        const bonusText = actResult.streakBonus
          ? ` (+10 pts Streak Bonus! ${actResult.currentStreak}d streak)`
          : "";
        setBanner({
          type: "success",
          text: `Marked "${item.title}" as Got It! +${actResult.pointsAwarded} pts${bonusText}`,
        });
      } else if (profile) {
        // Deduct 25 pts when unmarking to prevent point farming
        const newPts = Math.max(0, profile.points - 25);
        const newWk = Math.max(0, profile.weekly_points - 25);
        const newMastered = Math.max(0, profile.mastered_count - 1);
        const reverted: UserProfile = {
          ...profile,
          points: newPts,
          weekly_points: newWk,
          mastered_count: newMastered,
        };
        setProfile(reverted);
        const revertPayload = {
          id: user?.id,
          display_name: reverted.display_name,
          points: newPts,
          weekly_points: newWk,
          current_streak: reverted.current_streak,
          longest_streak: reverted.longest_streak,
          mastered_count: newMastered,
          last_active_date: formatPostgresDate(reverted.last_active_date),
        };

        const { error: revertErr, status, statusText } = await supabase
          .from("profiles")
          .upsert(revertPayload, { onConflict: "id" });

        if (revertErr) {
          const errStr = JSON.stringify(revertErr, Object.getOwnPropertyNames(revertErr));
          console.error("Supabase handleToggleStatus upsert error:", {
            status,
            statusText,
            error: errStr,
          });
          setBanner({
            type: "error",
            text: `Failed to update points [HTTP ${status}]: ${revertErr.message || errStr}`,
          });
        }

        loadLeaderboard(leaderboardPeriod);
      }
    }
  }

  // Handle Practice Drill Win (+15 pts)
  async function handleSpotBug(item: BugAutopsy) {
    if (solvedDrills[item.id]) return;

    setSolvedDrills((prev) => ({ ...prev, [item.id]: true }));
    setRevealedAnswers((prev) => ({ ...prev, [item.id]: true }));

    const actResult = await recordUserActivity("practice_win");
    const bonusText = actResult.streakBonus
      ? ` (+10 pts Streak Bonus! ${actResult.currentStreak}d streak)`
      : "";
    setBanner({
      type: "success",
      text: `Mistake spotted in "${item.title}"! +${actResult.pointsAwarded} pts${bonusText}`,
    });
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

  // Live merged leaderboard combining database records and current user profile
  const displayLeaderboard = useMemo(() => {
    const list: UserProfile[] = [...leaderboard];

    if (user && profile) {
      const existingIdx = list.findIndex((item) => item.id === user.id);
      const userEntry: UserProfile = {
        id: user.id,
        display_name: profile.display_name || user.email?.split("@")[0] || "Developer",
        points: profile.points || 0,
        weekly_points: profile.weekly_points || 0,
        current_streak: profile.current_streak || 0,
        longest_streak: profile.longest_streak || 0,
        mastered_count: profile.mastered_count ?? stats.mastered,
        last_active_date: profile.last_active_date,
      };

      if (existingIdx >= 0) {
        list[existingIdx] = {
          ...list[existingIdx],
          ...userEntry,
          points: Math.max(list[existingIdx].points || 0, userEntry.points),
          weekly_points: Math.max(list[existingIdx].weekly_points || 0, userEntry.weekly_points),
          current_streak: Math.max(list[existingIdx].current_streak || 0, userEntry.current_streak),
          longest_streak: Math.max(list[existingIdx].longest_streak || 0, userEntry.longest_streak),
          mastered_count: Math.max(list[existingIdx].mastered_count || 0, userEntry.mastered_count),
        };
      } else {
        list.push(userEntry);
      }
    }

    const sortField = leaderboardPeriod === "week" ? "weekly_points" : "points";
    return list.sort((a, b) => {
      const ptsA = a[sortField] ?? 0;
      const ptsB = b[sortField] ?? 0;
      if (ptsB !== ptsA) return ptsB - ptsA;
      const strA = a.current_streak ?? 0;
      const strB = b.current_streak ?? 0;
      return strB - strA;
    });
  }, [leaderboard, user, profile, stats.mastered, leaderboardPeriod]);

  // Compute current user rank in leaderboard
  const currentUserRank = useMemo(() => {
    if (!user || displayLeaderboard.length === 0) return 0;
    const idx = displayLeaderboard.findIndex((item) => item.id === user.id);
    return idx >= 0 ? idx + 1 : 0;
  }, [user, displayLeaderboard]);

  // Loading view
  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#09090b] text-zinc-400 font-sans text-sm">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
          <span>Opening Bug Autopsy Lab...</span>
        </div>
      </main>
    );
  }

  // Active theme tokens (Linear / Vercel style dark surface hierarchy)
  const isDark = theme === "dark";
  const bgMain = isDark ? "bg-[#09090b] text-zinc-100" : "bg-[#f8fafc] text-zinc-900";
  const bgCard = isDark ? "bg-[#111113] border-zinc-800" : "bg-white border-zinc-200 shadow-sm";
  const bgSubCard = isDark ? "bg-[#09090b] border-zinc-800/80" : "bg-zinc-50 border-zinc-200";
  const textMuted = isDark ? "text-zinc-400" : "text-zinc-500";
  const borderTone = isDark ? "border-zinc-800" : "border-zinc-200";
  const inputBg = isDark
    ? "bg-[#09090b] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
    : "bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400";

  // Signed out / Auth view
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#09090b] p-6 text-zinc-100 font-sans selection:bg-zinc-800">
        <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-[#111113] p-7 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3 text-zinc-300">
              <Terminal size={18} strokeWidth={1.5} />
            </div>
            <h1 className="text-base font-semibold tracking-tight text-white">{t.welcomeTitle}</h1>
            <p className="mt-1 text-xs text-zinc-400 leading-normal">{t.welcomeSub}</p>
          </div>

          <div className="mt-6 flex rounded-lg bg-[#09090b] p-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setAuthMessage("");
              }}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
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
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
                isSignUp ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t.createAccount}
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="mt-5 space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
                {t.emailLabel}
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
                {t.passwordLabel}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-800 bg-[#09090b] px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
              />
            </div>

            {authMessage && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-300">
                {authMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-1 rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-white active:scale-[0.99]"
            >
              {isSignUp ? t.createAccount : t.signIn}
            </button>
          </form>

          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <span className="relative bg-[#111113] px-2.5 text-[10px] uppercase tracking-wider text-zinc-500">
              {t.or}
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800 active:scale-[0.99]"
          >
            {t.continueGoogle}
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className={`min-h-screen flex ${bgMain} font-sans selection:bg-zinc-800 selection:text-zinc-100 transition-colors duration-150`}>
      {/* 1. Left Sidebar (focused strictly on core workflows: Check Code, Saved Fixes, Practice Game, Leaderboard) */}
      <aside
        className={`${
          sidebarCollapsed ? "w-16" : "w-60"
        } shrink-0 border-r ${borderTone} flex flex-col justify-between transition-all duration-200 select-none ${
          isDark ? "bg-[#09090b]" : "bg-white"
        }`}
      >
        <div className="p-3.5 space-y-5">
          {/* Logo & Brand Title */}
          <div
            onClick={() => setActiveTab("check")}
            className="flex items-center gap-2.5 cursor-pointer px-1 py-1 group"
          >
            <div className="h-8 w-8 shrink-0 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 group-hover:border-zinc-700 transition">
              <Terminal size={16} strokeWidth={1.5} className="text-zinc-300" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="font-semibold text-xs tracking-tight text-zinc-100 truncate leading-tight">
                  {t.appName}
                </h1>
                <p className="text-[11px] text-zinc-500 truncate leading-normal">
                  {t.tagline}
                </p>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: "check", label: t.navCheck, icon: Code2, badge: null },
              {
                id: "saved",
                label: t.navSaved,
                icon: BookmarkCheck,
                badge: stats.total > 0 ? stats.total : null,
              },
              {
                id: "practice",
                label: t.navPractice,
                icon: Target,
                badge: stats.needsPractice > 0 ? stats.needsPractice : null,
              },
              {
                id: "leaderboard",
                label: t.navLeaderboard,
                icon: Trophy,
                badge: null,
              },
            ].map((tab) => {
              const active = activeTab === tab.id;
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    if (tab.id === "practice") setBugHuntMode(true);
                    if (tab.id === "leaderboard") loadLeaderboard(leaderboardPeriod);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                    active
                      ? isDark
                        ? "bg-zinc-800/80 text-zinc-100 shadow-sm border border-zinc-700/60"
                        : "bg-zinc-100 text-zinc-900 border border-zinc-200 shadow-sm"
                      : isDark
                      ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                  }`}
                  title={tab.label}
                >
                  <IconComponent
                    size={16}
                    strokeWidth={1.5}
                    className={`shrink-0 ${active ? "text-zinc-100" : "text-zinc-400"}`}
                  />
                  {!sidebarCollapsed && (
                    <span className="flex-1 text-left truncate">{tab.label}</span>
                  )}
                  {!sidebarCollapsed && tab.badge !== null && (
                    <span
                      className={`text-[11px] font-mono px-1.5 py-0.2 rounded-md ${
                        tab.id === "practice"
                          ? isDark
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-amber-100 text-amber-800"
                          : isDark
                          ? "bg-zinc-800 text-zinc-300 border border-zinc-700/50"
                          : "bg-zinc-200 text-zinc-700"
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

        {/* Sidebar Footer with Collapse only */}
        <div className={`p-3 border-t ${borderTone}`}>
          <button
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className={`w-full flex items-center ${
              sidebarCollapsed ? "justify-center" : "justify-between"
            } px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
              isDark
                ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
            title={sidebarCollapsed ? t.expand : t.collapse}
          >
            {!sidebarCollapsed && (
              <span className="text-zinc-500 text-[11px] font-medium">Collapse</span>
            )}
            {sidebarCollapsed ? (
              <PanelLeftOpen size={16} strokeWidth={1.5} />
            ) : (
              <PanelLeftClose size={16} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </aside>

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header Bar with subtle streak indicator */}
        <header
          className={`sticky top-0 z-20 shrink-0 flex items-center justify-between px-6 py-3 border-b backdrop-blur-md ${borderTone} ${
            isDark ? "bg-[#09090b]/80" : "bg-white/80"
          }`}
        >
          {/* Active section breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <span className={`font-semibold tracking-tight ${isDark ? "text-zinc-200" : "text-zinc-900"}`}>
              Bug Autopsy
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400 font-medium">
              {activeTab === "check"
                ? t.navCheck
                : activeTab === "saved"
                ? t.navSaved
                : activeTab === "practice"
                ? t.navPractice
                : t.navLeaderboard}
            </span>
          </div>

          {/* Top-Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Daily Streak Indicator */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium transition ${
                isDark
                  ? "border-zinc-800 bg-zinc-900/60 text-zinc-300"
                  : "border-zinc-200 bg-zinc-100 text-zinc-700"
              }`}
              title={`Daily Streak: ${profile?.current_streak || 0} day${(profile?.current_streak || 0) === 1 ? "" : "s"} (Best: ${profile?.longest_streak || 0}d)`}
            >
              <Flame size={13} strokeWidth={1.5} className="text-zinc-400" />
              <span>{profile?.current_streak || 0}d streak</span>
            </div>

            {/* Subtle Secondary Export Button */}
            <button
              type="button"
              onClick={handleExportMarkdown}
              disabled={autopsies.length === 0}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
                isDark
                  ? "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                  : "border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              } disabled:opacity-30 disabled:pointer-events-none`}
              title={t.exportNotes}
            >
              <Download size={14} strokeWidth={1.5} />
              <span className="hidden sm:inline">{t.exportNotes}</span>
            </button>

            {/* Unified Settings Gear Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className={`p-1.5 rounded-lg border text-zinc-400 hover:text-zinc-100 transition ${
                isDark
                  ? "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800"
                  : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
              title={t.settingsTitle}
              aria-label="Settings"
            >
              <SettingsIcon size={16} strokeWidth={1.5} />
            </button>

            {/* User Avatar pill that also triggers Settings */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className={`flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-lg border transition ${
                isDark
                  ? "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800"
                  : "border-zinc-200 bg-zinc-100 hover:bg-zinc-200"
              }`}
              title={t.settingsTitle}
            >
              <div className="h-5 w-5 rounded-md bg-zinc-800 border border-zinc-700/60 text-zinc-300 font-mono text-[11px] font-semibold flex items-center justify-center">
                {user.email?.[0].toUpperCase() || "U"}
              </div>
              <span className="text-xs font-mono text-zinc-400 max-w-[120px] truncate hidden md:inline">
                {user.email?.split("@")[0]}
              </span>
            </button>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-6 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Banner notification */}
          {banner && (
            <div
              className={`flex items-start justify-between gap-3 rounded-lg border p-3.5 text-xs transition-all ${
                banner.type === "error"
                  ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {banner.type === "error" ? (
                  <AlertCircle size={15} strokeWidth={1.5} className="shrink-0 text-rose-400" />
                ) : (
                  <CheckCircle2 size={15} strokeWidth={1.5} className="shrink-0 text-emerald-400" />
                )}
                <span className="font-medium">{banner.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setBanner(null)}
                className="text-xs opacity-70 hover:opacity-100 transition ml-2"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
          )}

          {/* VIEW 1: Check Code (Primary input flow) */}
          {activeTab === "check" && (
            <div className="space-y-6">
              {/* Refined KPI Stat Cards with Streak and Points */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* Total Checked */}
                <div className={`rounded-xl border p-4 ${bgCard}`}>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 inline-block" />
                    <span>{t.totalChecked}</span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">
                    {stats.total}
                  </p>
                </div>

                {/* Still Learning */}
                <div className={`rounded-xl border p-4 ${bgCard}`}>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 inline-block" />
                    <span>{t.stillLearning}</span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">
                    {stats.needsPractice}
                  </p>
                </div>

                {/* Got It! */}
                <div className={`rounded-xl border p-4 ${bgCard}`}>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 inline-block" />
                    <span>{t.gotIt}</span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">
                    {stats.mastered}
                  </p>
                </div>

                {/* Daily Streak */}
                <div className={`rounded-xl border p-4 ${bgCard}`}>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <Flame size={12} strokeWidth={1.5} className="text-amber-400/90" />
                    <span>{t.streakStatLabel}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <p className="text-2xl font-semibold tracking-tight text-zinc-100">
                      {profile?.current_streak || 0}d
                    </p>
                    <span className="text-[11px] font-mono text-zinc-500">
                      Best: {profile?.longest_streak || 0}d
                    </span>
                  </div>
                </div>

                {/* Developer Points */}
                <div className={`rounded-xl border p-4 ${bgCard}`}>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 inline-block" />
                    <span>{t.pointsStatLabel}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <p className="text-2xl font-semibold tracking-tight text-zinc-100">
                      {profile?.points || 0}
                    </p>
                    <span className="text-[11px] font-mono text-emerald-400/90">
                      +{profile?.weekly_points || 0} wk
                    </span>
                  </div>
                </div>
              </div>

              {/* Paste Broken Code Input Card */}
              <section className={`rounded-xl border p-5 sm:p-6 shadow-sm ${bgCard}`}>
                <form onSubmit={handleRunAutopsy} className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold tracking-tight text-zinc-100">{t.pasteTitle}</h3>
                      <p className={`text-xs mt-0.5 ${textMuted}`}>{t.pasteSub}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className={`rounded-lg border pl-2.5 pr-7 py-1.5 text-xs font-medium outline-none cursor-pointer appearance-none ${inputBg}`}
                        >
                          {LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>
                              {lang}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={13}
                          strokeWidth={1.5}
                          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={loadSampleBug}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition inline-flex items-center gap-1.5 ${
                          isDark
                            ? "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                            : "border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                        }`}
                      >
                        <Sparkles size={13} strokeWidth={1.5} className="text-zinc-400" />
                        <span>{t.tryExample}</span>
                      </button>
                    </div>
                  </div>

                  {/* Code Textarea with font-mono & subtle line-height polish */}
                  <div className="relative">
                    <textarea
                      placeholder={t.codePlaceholder}
                      value={brokenCode}
                      onChange={(e) => setBrokenCode(e.target.value)}
                      rows={9}
                      required
                      spellCheck={false}
                      className={`w-full rounded-lg border p-3.5 font-mono text-xs sm:text-sm leading-relaxed outline-none transition resize-y ${inputBg}`}
                    />
                  </div>

                  {/* Optional Error Output */}
                  <div>
                    {!showErrorField && !errorOutput ? (
                      <button
                        type="button"
                        onClick={() => setShowErrorField(true)}
                        className="text-xs text-zinc-400 hover:text-zinc-200 transition inline-flex items-center gap-1.5"
                      >
                        <Plus size={13} strokeWidth={1.5} />
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
                          className={`w-full rounded-lg border px-3 py-2 font-mono text-xs text-rose-300 placeholder:text-zinc-600 outline-none ${inputBg}`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Check My Code Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isAnalyzing || !brokenCode.trim()}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 px-5 py-2.5 text-xs font-semibold shadow-sm transition active:scale-[0.99] disabled:opacity-40 disabled:hover:bg-zinc-100 cursor-pointer"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                          <span>{t.checkingButton}</span>
                        </>
                      ) : (
                        <>
                          <Play size={13} strokeWidth={2} className="fill-zinc-950" />
                          <span>{t.checkButton}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>

              {/* Quick links */}
              {autopsies.length > 0 && (
                <div className="pt-2 flex items-center justify-between">
                  <p className={`text-xs uppercase tracking-wider font-semibold ${textMuted}`}>
                    {t.navSaved} ({autopsies.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("saved")}
                    className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
                  >
                    <span>View all saved autopsies</span>
                    <ArrowRight size={13} strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2 & VIEW 3: Saved Fixes & Practice Game */}
          {(activeTab === "saved" || activeTab === "practice") && (
            <div className="space-y-5">
              {/* Practice Game Header */}
              {activeTab === "practice" && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-zinc-100">
                      {t.practiceChallenge}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {t.practiceSub}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuizRandomBug}
                    disabled={stats.needsPractice === 0}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 px-3.5 py-1.5 text-xs font-medium transition disabled:opacity-40 disabled:hover:bg-zinc-100 shadow-sm"
                  >
                    <Sparkles size={14} strokeWidth={1.5} />
                    <span>{t.quizStillLearning}</span>
                    {stats.needsPractice > 0 && (
                      <span className="rounded bg-zinc-300/80 px-1.5 py-0.2 text-[10px] font-mono font-bold text-zinc-900">
                        {stats.needsPractice}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                {/* Status Tabs */}
                <div
                  className={`flex items-center gap-1 rounded-lg p-1 border self-start ${
                    isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200"
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
                      className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                        statusFilter === tab.value
                          ? isDark
                            ? "bg-zinc-800 text-zinc-100 shadow-sm"
                            : "bg-zinc-900 text-white shadow-sm"
                          : textMuted
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search & Extra Filters Button */}
                <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                  <div className="relative flex-1">
                    <Search
                      size={14}
                      strokeWidth={1.5}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                    />
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full rounded-lg border pl-8 pr-3 py-1.5 text-xs outline-none ${inputBg}`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAdvancedFilters((prev) => !prev)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition inline-flex items-center gap-1.5 whitespace-nowrap ${
                      showAdvancedFilters || languageFilter !== "All" || categoryFilter !== "All"
                        ? isDark
                          ? "border-zinc-700 bg-zinc-800 text-zinc-200"
                          : "border-zinc-300 bg-zinc-100 text-zinc-800"
                        : isDark
                        ? "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                        : "border-zinc-200 bg-white text-zinc-600"
                    }`}
                  >
                    <SlidersHorizontal size={13} strokeWidth={1.5} />
                    <span>{t.filters}</span>
                  </button>
                </div>
              </div>

              {/* Advanced Filter Row */}
              {showAdvancedFilters && (
                <div className={`flex flex-wrap items-center gap-4 rounded-lg border p-3 ${bgCard}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${textMuted}`}>{t.language}:</span>
                    <select
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                      className={`rounded-md border px-2 py-1 text-xs outline-none ${inputBg}`}
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
                      className={`rounded-md border px-2 py-1 text-xs outline-none ${inputBg}`}
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
                      className="text-xs text-zinc-400 hover:text-zinc-200 underline"
                    >
                      {t.resetFilters}
                    </button>
                  )}
                </div>
              )}

              {/* Cards List */}
              <div className="space-y-4">
                {dataLoading ? (
                  <div className={`text-center py-12 text-xs ${textMuted}`}>{t.loadingBugs}</div>
                ) : filteredAutopsies.length === 0 ? (
                  <div className={`rounded-xl border border-dashed p-10 text-center ${borderTone}`}>
                    <div className="mx-auto w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
                      <Search size={18} strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-medium text-zinc-200">{t.noBugsTitle}</p>
                    <p className={`text-xs mt-1 max-w-sm mx-auto ${textMuted}`}>{t.noBugsSub}</p>
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
                        className={`rounded-xl border p-5 sm:p-6 transition-all ${bgCard} ${
                          isHighlighted ? "border-zinc-500 ring-1 ring-zinc-500/40" : ""
                        }`}
                      >
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-semibold tracking-tight text-zinc-100">{item.title}</h4>
                            <span
                              className={`rounded-md px-2 py-0.5 text-[11px] font-mono ${
                                isDark
                                  ? "bg-zinc-800 text-zinc-300 border border-zinc-700/60"
                                  : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                              }`}
                            >
                              {item.language}
                            </span>
                            <span
                              className={`rounded-md border px-2 py-0.5 text-[11px] ${
                                isDark
                                  ? "border-zinc-800 bg-zinc-900/50 text-zinc-400"
                                  : "border-zinc-200 bg-zinc-50 text-zinc-600"
                              }`}
                            >
                              {item.bug_category}
                            </span>
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
                              isMastered
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {isMastered ? t.gotIt : t.stillLearning}
                          </span>
                        </div>

                        {/* Practice Mode view for this card */}
                        {isGameCard ? (
                          <div
                            className={`mt-4 rounded-lg border p-4 space-y-3.5 ${
                              isDark
                                ? "border-zinc-800 bg-[#09090b]"
                                : "border-zinc-200 bg-zinc-50"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="text-xs font-semibold text-zinc-300">
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
                                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                                      isDark
                                        ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                                        : "border-zinc-300 text-zinc-700 hover:bg-white"
                                    }`}
                                  >
                                    {revealedHints[item.id] ? t.hideHint : t.showHint}
                                  </button>
                                )}

                                {/* Solve Drill & Earn +15 pts Button */}
                                <button
                                  type="button"
                                  onClick={() => handleSpotBug(item)}
                                  className="rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 px-3 py-1 text-xs font-semibold transition"
                                >
                                  {t.spotBug}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setRevealedAnswers((prev) => ({ ...prev, [item.id]: true }))
                                  }
                                  className="rounded-md border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 px-3 py-1 text-xs font-medium transition"
                                >
                                  {t.revealSolution}
                                </button>
                              </div>
                            </div>

                            {revealedHints[item.id] && item.challenge_hint && (
                              <div className="rounded-md bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-zinc-300 flex items-start gap-2">
                                <HelpCircle size={14} strokeWidth={1.5} className="text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold">{t.hintLabel}</span> {item.challenge_hint}
                                </div>
                              </div>
                            )}

                            <pre
                              className={`overflow-x-auto rounded-lg border p-3.5 font-mono text-xs leading-relaxed ${
                                isDark
                                  ? "bg-zinc-950 border-zinc-800 text-zinc-200"
                                  : "bg-zinc-900 border-zinc-800 text-zinc-200"
                              }`}
                            >
                              <code>{item.challenge_code || item.broken_code}</code>
                            </pre>
                          </div>
                        ) : (
                          /* Normal Autopsy Details */
                          <div className="mt-4 space-y-4">
                            {/* What Went Wrong Callout */}
                            <div className={`rounded-lg border p-4 ${bgSubCard}`}>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                                {t.whatWentWrong}
                              </p>
                              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-zinc-200">
                                {item.diagnosis}
                              </p>
                              {item.error_output && (
                                <div className="mt-2.5 rounded-md border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 font-mono text-xs text-rose-300">
                                  {item.error_output}
                                </div>
                              )}
                            </div>

                            {/* Side-by-side Broken vs Fixed Code */}
                            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                              {/* Broken Code Box */}
                              <div
                                className={`rounded-lg border border-zinc-800 p-3.5 ${
                                  isDark ? "bg-[#09090b]" : "bg-zinc-900"
                                }`}
                              >
                                <div className="flex items-center gap-1.5 mb-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                                  <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-300">
                                    {t.brokenCode}
                                  </span>
                                </div>
                                <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-zinc-300">
                                  <code>{item.broken_code}</code>
                                </pre>
                              </div>

                              {/* Fixed Code Box */}
                              <div
                                className={`rounded-lg border border-zinc-800 p-3.5 ${
                                  isDark ? "bg-[#09090b]" : "bg-zinc-900"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                                      {t.fixedCode}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyCode(item.id, item.fixed_code)}
                                    className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 text-[11px] font-medium text-zinc-200 hover:bg-zinc-700 transition"
                                  >
                                    {copiedId === item.id ? (
                                      <>
                                        <Check size={12} strokeWidth={2} />
                                        <span>{t.copied}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={12} strokeWidth={1.5} />
                                        <span>{t.copyFix}</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-emerald-300">
                                  <code>{item.fixed_code}</code>
                                </pre>
                              </div>
                            </div>

                            {/* Walkthrough */}
                            {item.walkthrough && (
                              <div className={`rounded-lg border p-3.5 ${bgSubCard}`}>
                                <p className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>
                                  {t.explanation}
                                </p>
                                <p className="mt-1.5 whitespace-pre-line text-xs sm:text-sm leading-relaxed text-zinc-300">
                                  {item.walkthrough}
                                </p>
                              </div>
                            )}

                            {/* Optional Practice Puzzle */}
                            {item.challenge_code && (
                              <details className={`rounded-lg border p-3 ${bgSubCard}`}>
                                <summary className="cursor-pointer text-xs font-medium text-zinc-300 hover:text-white transition">
                                  {t.testYourself}
                                </summary>
                                <div className="mt-3 space-y-2">
                                  {item.challenge_hint && (
                                    <p className={`text-xs ${textMuted}`}>
                                      <span className="font-semibold">{t.hintLabel}</span> {item.challenge_hint}
                                    </p>
                                  )}
                                  <pre
                                    className={`overflow-x-auto rounded-md border p-3 font-mono text-xs leading-relaxed ${
                                      isDark
                                        ? "bg-zinc-950 border-zinc-800 text-zinc-200"
                                        : "bg-zinc-900 border-zinc-800 text-zinc-200"
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
                          className={`mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3.5 ${borderTone}`}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                              isMastered
                                ? isDark
                                  ? "border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                  : "border border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                : isDark
                                ? "bg-zinc-100 hover:bg-white text-zinc-950 font-semibold"
                                : "bg-zinc-900 hover:bg-zinc-800 text-white font-semibold"
                            }`}
                          >
                            {isMastered ? (
                              <>
                                <RotateCcw size={13} strokeWidth={1.5} />
                                <span>{t.markStillLearning}</span>
                              </>
                            ) : (
                              <>
                                <Check size={13} strokeWidth={2} />
                                <span>{t.markGotIt}</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                          >
                            <Trash2 size={13} strokeWidth={1.5} />
                            <span>{t.delete}</span>
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* VIEW 4: Global Leaderboard View */}
          {activeTab === "leaderboard" && (
            <div className="space-y-5">
              {/* Leaderboard Header with Segmented Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                    <Trophy size={16} strokeWidth={1.5} className="text-zinc-400" />
                    <span>{t.leaderboardTitle}</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {t.leaderboardSub}
                  </p>
                </div>

                {/* Segmented Toggle: This Week vs All-Time */}
                <div
                  className={`flex items-center gap-1 rounded-lg p-1 border self-start ${
                    isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setLeaderboardPeriod("all");
                      loadLeaderboard("all");
                    }}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                      leaderboardPeriod === "all"
                        ? isDark
                          ? "bg-zinc-800 text-zinc-100 shadow-sm"
                          : "bg-zinc-900 text-white shadow-sm"
                        : textMuted
                    }`}
                  >
                    {t.allTime}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLeaderboardPeriod("week");
                      loadLeaderboard("week");
                    }}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                      leaderboardPeriod === "week"
                        ? isDark
                          ? "bg-zinc-800 text-zinc-100 shadow-sm"
                          : "bg-zinc-900 text-white shadow-sm"
                        : textMuted
                    }`}
                  >
                    {t.thisWeek}
                  </button>
                </div>
              </div>

              {/* Leaderboard Table Card */}
              <div className={`rounded-xl border overflow-hidden ${bgCard}`}>
                {leaderboardLoading ? (
                  <div className="p-12 text-center text-xs text-zinc-500">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent mx-auto mb-2" />
                    <span>Loading global rankings...</span>
                  </div>
                ) : displayLeaderboard.length === 0 ? (
                  <div className="p-12 text-center">
                    <Trophy size={24} strokeWidth={1.5} className="text-zinc-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-zinc-300">{t.noLeaderboardTitle}</p>
                    <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">{t.noLeaderboardSub}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className={`border-b ${borderTone} text-[11px] font-medium uppercase tracking-wider text-zinc-400 bg-zinc-900/30`}>
                          <th className="py-3 pl-4 pr-2 w-16">{t.rankCol}</th>
                          <th className="py-3 px-3">{t.devCol}</th>
                          <th className="py-3 px-3 text-center w-28">{t.streakCol}</th>
                          <th className="py-3 px-3 text-center w-28">{t.masteredCol}</th>
                          <th className="py-3 pr-4 pl-2 text-right w-28">{t.pointsCol}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 font-mono">
                        {displayLeaderboard.map((dev, idx) => {
                          const isCurrentUser = user?.id === dev.id;
                          const rank = idx + 1;
                          const pointsVal = leaderboardPeriod === "week" ? dev.weekly_points : dev.points;

                          return (
                            <tr
                              key={dev.id}
                              className={`transition ${
                                isCurrentUser
                                  ? isDark
                                    ? "bg-zinc-800/40 border-l-2 border-l-zinc-300"
                                    : "bg-zinc-100/70 border-l-2 border-l-zinc-900"
                                  : isDark
                                  ? "hover:bg-zinc-900/40"
                                  : "hover:bg-zinc-50"
                              }`}
                            >
                              {/* Rank */}
                              <td className="py-3 pl-4 pr-2 font-mono">
                                <span
                                  className={`inline-block text-xs font-bold ${
                                    rank === 1
                                      ? "text-amber-300 font-extrabold"
                                      : rank === 2
                                      ? "text-zinc-300"
                                      : rank === 3
                                      ? "text-zinc-400"
                                      : "text-zinc-500 font-normal"
                                  }`}
                                >
                                  #{rank}
                                </span>
                              </td>

                              {/* Developer */}
                              <td className="py-3 px-3 font-sans">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-md bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-[11px] font-mono font-semibold flex items-center justify-center shrink-0">
                                    {dev.display_name?.[0]?.toUpperCase() || "D"}
                                  </div>
                                  <span className="font-medium text-xs text-zinc-200 truncate max-w-[180px] sm:max-w-xs">
                                    {dev.display_name}
                                  </span>
                                  {isCurrentUser && (
                                    <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-zinc-300 border border-zinc-700/60">
                                      {t.youBadge}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Streak */}
                              <td className="py-3 px-3 text-center">
                                <span className="inline-flex items-center gap-1 text-xs text-zinc-300">
                                  <Flame size={12} strokeWidth={1.5} className="text-zinc-400" />
                                  <span>{dev.current_streak}d</span>
                                </span>
                              </td>

                              {/* Mastered Fixes */}
                              <td className="py-3 px-3 text-center text-xs text-zinc-300">
                                {dev.mastered_count || 0}
                              </td>

                              {/* Points */}
                              <td className="py-3 pr-4 pl-2 text-right">
                                <span className="font-semibold text-xs text-zinc-100">
                                  {pointsVal} pts
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pinned User Standing Bar */}
              {user && (
                <div
                  className={`rounded-xl border p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs ${
                    isDark
                      ? "border-zinc-800 bg-[#111113] text-zinc-300"
                      : "border-zinc-200 bg-white text-zinc-700 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-100">{t.yourRankLabel}:</span>
                    <span className="font-mono font-bold text-zinc-100">
                      {currentUserRank > 0 ? `#${currentUserRank}` : "—"}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="font-mono text-zinc-400">
                      {user.email?.split("@")[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5" title="Daily Streak">
                      <Flame size={13} strokeWidth={1.5} className="text-zinc-400" />
                      <span>{profile?.current_streak || 0}d</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Mastered Fixes">
                      <BookmarkCheck size={13} strokeWidth={1.5} className="text-zinc-400" />
                      <span>{profile?.mastered_count || stats.mastered}</span>
                    </div>
                    <div className="font-semibold text-zinc-100">
                      {leaderboardPeriod === "week"
                        ? `${profile?.weekly_points || 0} pts`
                        : `${profile?.points || 0} pts`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 3. Unified Top-Right Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-xl border ${
              isDark ? "border-zinc-800 bg-[#111113]" : "border-zinc-200 bg-white"
            } p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in duration-150`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <SettingsIcon size={16} strokeWidth={1.5} className="text-zinc-400" />
                <h3 className="text-sm font-semibold tracking-tight text-zinc-100">
                  {t.settingsTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 p-1 rounded-md transition"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* 1. Appearance */}
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                {t.appearance}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition ${
                    theme === "dark"
                      ? "border-zinc-600 bg-zinc-800 text-zinc-100 font-semibold"
                      : isDark
                      ? "border-zinc-800 bg-[#09090b] text-zinc-400 hover:text-zinc-200"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600"
                  }`}
                >
                  <Moon size={14} strokeWidth={1.5} />
                  <span>{t.themeDark}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition ${
                    theme === "light"
                      ? "border-zinc-600 bg-zinc-800 text-zinc-100 font-semibold"
                      : isDark
                      ? "border-zinc-800 bg-[#09090b] text-zinc-400 hover:text-zinc-200"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600"
                  }`}
                >
                  <Sun size={14} strokeWidth={1.5} />
                  <span>{t.themeLight}</span>
                </button>
              </div>
            </div>

            {/* 2. Language */}
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                {t.uiLanguage}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {UI_LANGUAGES.map((langItem) => {
                  const isSelected = uiLang === langItem.code;
                  return (
                    <button
                      key={langItem.code}
                      type="button"
                      onClick={() => setUiLang(langItem.code)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                        isSelected
                          ? "border-zinc-600 bg-zinc-800 text-zinc-100 font-semibold"
                          : isDark
                          ? "border-zinc-800 bg-[#09090b] text-zinc-400 hover:text-zinc-200"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600"
                      }`}
                    >
                      <span>{langItem.label}</span>
                      {isSelected && <Check size={13} strokeWidth={2} className="text-zinc-200" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Account Information */}
            <div className="space-y-2 pt-1 border-t border-zinc-800/80">
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                {t.account}
              </label>
              <div className={`p-3 rounded-lg border ${bgSubCard} flex items-center justify-between`}>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{t.signedInAs}</p>
                  <p className="text-xs font-mono font-medium text-zinc-200 mt-0.5">{user.email}</p>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{t.streakStatLabel}</p>
                    <p className="text-xs font-mono font-semibold text-amber-400/90 mt-0.5">
                      {profile?.current_streak || 0}d
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{t.pointsStatLabel}</p>
                    <p className="text-xs font-mono font-semibold text-zinc-100 mt-0.5">
                      {profile?.points || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sign Out Action */}
            <div className="pt-2 flex items-center justify-between border-t border-zinc-800/80">
              <div>
                <p className="text-xs font-medium text-zinc-300">{t.dangerZone}</p>
                <p className="text-[11px] text-zinc-500">End your active session.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  handleLogout();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-3 py-1.5 text-xs font-medium transition"
              >
                <LogOut size={13} strokeWidth={1.5} />
                <span>{t.logOutButton}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
