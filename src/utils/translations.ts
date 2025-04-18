import { date } from "zod";

export const translations = {
  en: {
    appName: "Cash Calculator",
    participants: "Participants",
    participantId: "Participant Name",
    purchaseAmount: "Purchase Amount",
    hasBankAccount: "Has Bank Account",
    addParticipant: "Add Participant",
    currentParticipants: "Current Participants",
    participantsAdded: "List of participants added",
    id: "ID",
    bankAccount: "Bank Account",
    actions: "Actions",
    delete: "Delete",
    calculatePayments: "Calculate Payments",
    reviewHistory: "Review Calculation History",
    calculationResults: "Calculation Results",
    participant: "Participant",
    grossPayment: "Gross Payment",
    cashReceived: "Cash Received",
    netPayment: "Net Payment",
    cashContributed: "Cash Contributed",
    yes: "Yes",
    no: "No",
    enterAmount: "Enter amount",
    enterId: "Enter ID",
    error: "Error",
    close: "Close",
    timestamp: "Timestamp",
    results: "Results",
    calculation: "Calculation",
    noCalculationHistory: "No calculation history available.",
    reviewPreviousCalculations: "Review previous calculations.",
    fillAllFields: "Please fill in all fields.",
    enterValidAmount: "Please enter a valid purchase amount.",
    noBankParticipants: "Error: Cannot distribute cash. No bank participants.",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    total: "Total",
    totalPurchaseAmount: "Total Purchase Amount",
    overallSummary: "Overall Summary",
    totalCalculations: "Total Calculations",
    uniqueParticipants: "Unique Participants",
    averagePurchasePerCalculation: "Average Purchase Per Calculation",
    totalNetBankPayments: "Total Net Bank Payments",
    totalCashContributed: "Total Cash Contributed",
    bankAccountsUsed: "Bank Account Calculations",
    cashOnlyUsed: "Cash-Only Calculations",
    enterParticipantDetails: "Enter participant details below",
    calculationHistory: "Calculation History",
    date: "Date",
    exportToWord: "Export to Word",
  },
  ar: {
    appName: "حاسبة النقود",
    participants: "المشاركون",
    participantId: "اسم المشارك",
    purchaseAmount: "مبلغ الشراء",
    hasBankAccount: "لديه حساب مصرفي",
    addParticipant: "إضافة مشارك",
    currentParticipants: "المشاركون الحاليون",
    participantsAdded: "قائمة المشاركين المضافة",
    id: "المعرف",
    bankAccount: "حساب مصرفي",
    actions: "إجراءات",
    delete: "حذف",
    calculatePayments: "حساب المدفوعات",
    reviewHistory: "مراجعة سجل الحسابات",
    calculationResults: "نتائج الحساب",
    participant: "مشارك",
    grossPayment: "المبلغ الإجمالي",
    cashReceived: "النقد المستلم",
    netPayment: "صافي الدفع",
    cashContributed: "النقد المساهم",
    yes: "نعم",
    no: "لا",
    enterAmount: "أدخل المبلغ",
    enterId: "أدخل المعرف",
    error: "خطأ",
    close: "إغلاق",
    timestamp: "الوقت",
    results: "النتائج",
    calculation: "الحساب",
    noCalculationHistory: "لا يوجد سجل حسابات متاح.",
    reviewPreviousCalculations: "مراجعة الحسابات السابقة.",
    fillAllFields: "يرجى ملء جميع الحقول.",
    enterValidAmount: "يرجى إدخال مبلغ شراء صالح.",
    noBankParticipants: "خطأ: لا يمكن توزيع النقد. لا يوجد مشاركون بنكيون.",
    lightMode: "الوضع الفاتح",
    darkMode: "الوضع الداكن",
    total: "المجموع",
    totalPurchaseAmount: "إجمالي مبلغ الشراء",
    overallSummary: "الملخص الإجمالي",
    totalCalculations: "إجمالي الحسابات",
    uniqueParticipants: "المشاركون الفريدون",
    averagePurchasePerCalculation: "متوسط الشراء لكل حساب",
    totalNetBankPayments: "إجمالي المدفوعات المصرفية الصافية",
    totalCashContributed: "إجمالي النقد المساهم",
    bankAccountsUsed: "حسابات الحساب المصرفي",
    cashOnlyUsed: "حسابات النقد فقط",
    enterParticipantDetails: "أدخل تفاصيل المشارك أدناه",
    calculationHistory: "تاريخ الحسابات",
    date: "التاريخ",
    exportToWord: "تصدير إلى ملف Word",
  }
};

export type TranslationKey = keyof typeof translations.en;

export function getTranslation(language: string, key: TranslationKey): string {
  return translations[language as keyof typeof translations]?.[key] || translations.en[key];
}