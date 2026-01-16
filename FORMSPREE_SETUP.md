# إعداد Formspree للنموذج

## الخطوات المطلوبة

### 1. إنشاء حساب Formspree (مجاني)

1. اذهب إلى https://formspree.io/
2. اضغط على "Get Started" أو "Sign Up"
3. سجل حساب جديد باستخدام البريد الإلكتروني

### 2. إنشاء نموذج جديد

1. بعد تسجيل الدخول، اضغط على "+ New Form"
2. أدخل اسم النموذج: "Quick Booking Form - تشخيصي"
3. سيتم إنشاء Form ID تلقائياً (مثل: `xyzabc123`)

### 3. الحصول على Form Endpoint

بعد إنشاء النموذج، ستحصل على endpoint بهذا الشكل:
```
https://formspree.io/f/YOUR_FORM_ID
```

### 4. تحديث الكود

افتح ملف `client/src/components/QuickBookingForm.tsx` وابحث عن هذا السطر:

```typescript
const response = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
```

استبدل `YOUR_FORM_ID` بالـ Form ID الخاص بك.

**مثال:**
```typescript
const response = await fetch("https://formspree.io/f/xyzabc123", {
```

### 5. إعدادات النموذج في Formspree

في لوحة تحكم Formspree، يمكنك:

**أ. إعداد الإشعارات:**
- Settings → Email Notifications
- أضف البريد الإلكتروني الذي تريد استقبال الإشعارات عليه
- فعّل "Send me an email when a new submission is received"

**ب. رسالة التأكيد:**
- Settings → Confirmation
- فعّل "Send confirmation email to submitter"
- خصص رسالة التأكيد بالعربية

**ج. رسالة الشكر:**
- Settings → Success Message
- خصص رسالة الشكر (اختياري - لأن الكود يعرض رسالة مخصصة)

**د. حماية من السبام:**
- Settings → Spam Protection
- فعّل reCAPTCHA (اختياري)

### 6. الخطة المجانية

**الحد المجاني:**
- 50 إرسال/شهر
- إشعارات بريد إلكتروني
- تخزين البيانات لمدة 30 يوم
- تصدير البيانات CSV

**إذا احتجت المزيد:**
- Basic Plan: $10/شهر - 1000 إرسال
- Pro Plan: $40/شهر - 10,000 إرسال

### 7. عرض البيانات المرسلة

في لوحة تحكم Formspree:
1. اضغط على اسم النموذج
2. ستظهر جميع الإرسالات مع:
   - الاسم
   - رقم الجوال
   - البريد الإلكتروني
   - نوع الخدمة
   - التاريخ والوقت

### 8. تصدير البيانات

- اضغط على "Export" في صفحة النموذج
- اختر CSV أو JSON
- يمكنك استيراد البيانات في Excel أو Google Sheets

### 9. التكامل مع أدوات أخرى (اختياري)

Formspree يدعم التكامل مع:
- **Zapier**: لإرسال البيانات إلى Google Sheets، Slack، إلخ
- **Webhooks**: لإرسال البيانات إلى API خاص
- **Mailchimp**: لإضافة المشتركين تلقائياً

### 10. اختبار النموذج

بعد تحديث الكود ونشره:
1. افتح صفحة الخدمات
2. املأ النموذج بمعلومات تجريبية
3. تحقق من وصول البيانات في لوحة تحكم Formspree
4. تحقق من وصول إشعار البريد الإلكتروني

## ملاحظات مهمة

- ✅ **مجاني تماماً** حتى 50 إرسال/شهر
- ✅ **لا يحتاج backend** أو قاعدة بيانات
- ✅ **إشعارات تلقائية** عبر البريد
- ✅ **سهل الإعداد** - 5 دقائق فقط
- ✅ **آمن ومشفر** - HTTPS
- ⚠️ **يحتاج تحديث الكود** بـ Form ID الخاص بك

## البديل: استخدام البريد الإلكتروني مباشرة

إذا أردت استخدام بريدك الإلكتروني مباشرة بدون Formspree:

```typescript
const response = await fetch("https://formspree.io/f/YOUR_EMAIL", {
```

استبدل `YOUR_EMAIL` ببريدك الإلكتروني (مثل: `info@tashkheesy.com`)

في أول مرة، ستحتاج تأكيد البريد الإلكتروني.

## الدعم

إذا واجهت أي مشكلة:
- Documentation: https://help.formspree.io/
- Support: support@formspree.io
