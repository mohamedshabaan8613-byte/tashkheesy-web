# إعداد Google Analytics

## الخطوات المطلوبة

### 1. إنشاء حساب Google Analytics (مجاني)

1. اذهب إلى https://analytics.google.com/
2. سجل الدخول بحساب Google الخاص بك
3. اضغط على "Start measuring" أو "البدء في القياس"

### 2. إنشاء Property جديد

1. **Account name**: أدخل "تشخيصي" أو اسم شركتك
2. **Property name**: أدخل "Tashkheesy Web"
3. **Reporting time zone**: اختر "Saudi Arabia" أو المنطقة الزمنية المناسبة
4. **Currency**: اختر "Saudi Riyal (SAR)"

### 3. إعداد Data Stream

1. اختر **Web** كمنصة
2. **Website URL**: أدخل `https://tashkheesy-web.vercel.app`
3. **Stream name**: أدخل "Tashkheesy Website"
4. اضغط "Create stream"

### 4. الحصول على Measurement ID

بعد إنشاء الـ stream، ستحصل على **Measurement ID** بهذا الشكل:
```
G-XXXXXXXXXX
```

مثال: `G-ABC123DEF4`

### 5. تحديث الكود

افتح ملف `client/index.html` وابحث عن هذين السطرين:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

و

```javascript
gtag('config', 'G-XXXXXXXXXX');
```

استبدل `G-XXXXXXXXXX` بالـ Measurement ID الخاص بك في **كلا الموضعين**.

**مثال:**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123DEF4"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-ABC123DEF4');
</script>
```

### 6. ما يتم تتبعه تلقائياً

بعد التفعيل، سيتم تتبع:

- ✅ **Page views**: عدد زيارات كل صفحة
- ✅ **Sessions**: عدد الجلسات
- ✅ **Users**: عدد المستخدمين (جديد + عائد)
- ✅ **Bounce rate**: معدل الارتداد
- ✅ **Session duration**: مدة الجلسة
- ✅ **Traffic sources**: مصادر الزيارات (Google, Social, Direct, إلخ)
- ✅ **Device category**: نوع الجهاز (Mobile, Desktop, Tablet)
- ✅ **Location**: الموقع الجغرافي للزوار

### 7. تتبع الأحداث المخصصة

الكود يتضمن تتبع حدث إرسال النموذج:

```typescript
gtag("event", "form_submission", {
  event_category: "engagement",
  event_label: "quick_booking_form",
  value: formData.service,
});
```

هذا سيظهر في:
- **Reports** → **Engagement** → **Events**
- اسم الحدث: `form_submission`

### 8. إعداد تحويلات (Conversions)

لتتبع التحويلات:

1. في Google Analytics، اذهب إلى **Admin** (الإعدادات)
2. في عمود **Property**، اضغط على **Events**
3. ابحث عن حدث `form_submission`
4. اضغط على **Mark as conversion** (وضع علامة كتحويل)

الآن يمكنك تتبع عدد التحويلات في:
- **Reports** → **Engagement** → **Conversions**

### 9. إعداد الأهداف (Goals)

يمكنك إنشاء أهداف مخصصة:

1. **Admin** → **Goals** → **New Goal**
2. اختر **Custom**
3. **Goal name**: "نموذج حجز سريع"
4. **Type**: Event
5. **Event conditions**:
   - Category equals: `engagement`
   - Action equals: `form_submission`
6. احفظ

### 10. التقارير المفيدة

**أ. تقرير الوقت الفعلي:**
- **Reports** → **Realtime** → **Overview**
- شاهد الزوار الحاليين على الموقع

**ب. تقرير الصفحات:**
- **Reports** → **Engagement** → **Pages and screens**
- شاهد أكثر الصفحات زيارة

**ج. تقرير التحويلات:**
- **Reports** → **Engagement** → **Conversions**
- شاهد عدد النماذج المرسلة

**د. تقرير المصادر:**
- **Reports** → **Acquisition** → **Traffic acquisition**
- شاهد من أين يأتي الزوار

**هـ. تقرير الأجهزة:**
- **Reports** → **Tech** → **Overview**
- شاهد نوع الأجهزة المستخدمة

### 11. ربط Google Analytics مع Google Search Console

لتتبع أداء الموقع في نتائج البحث:

1. **Admin** → **Product links** → **Search Console links**
2. اضغط **Link**
3. اختر موقعك في Search Console
4. أكمل الربط

### 12. اختبار التتبع

بعد تحديث الكود ونشره:

1. افتح الموقع في متصفح
2. في Google Analytics، اذهب إلى **Realtime** → **Overview**
3. يجب أن ترى نفسك كزائر نشط
4. جرب إرسال النموذج
5. تحقق من ظهور حدث `form_submission` في **Realtime** → **Events**

### 13. تطبيق الجوال (اختياري)

يمكنك تحميل تطبيق Google Analytics للجوال:
- iOS: https://apps.apple.com/app/google-analytics/id881599038
- Android: https://play.google.com/store/apps/details?id=com.google.android.apps.giant

### 14. ملاحظات مهمة

- ✅ **مجاني تماماً** - بدون حدود
- ✅ **يعمل فوراً** بعد التفعيل
- ✅ **تقارير شاملة** عن سلوك الزوار
- ✅ **تتبع التحويلات** والأهداف
- ⚠️ **البيانات تظهر بعد 24-48 ساعة** (Realtime فوري)
- ⚠️ **يحتاج تحديث الكود** بـ Measurement ID الخاص بك

### 15. الخصوصية والامتثال

تأكد من:
- ✅ إضافة إشعار ملفات تعريف الارتباط (Cookies) في الموقع
- ✅ تحديث سياسة الخصوصية لتتضمن استخدام Google Analytics
- ✅ تفعيل IP Anonymization إذا لزم الأمر (للامتثال لـ GDPR)

لتفعيل IP Anonymization، أضف هذا السطر:
```javascript
gtag('config', 'G-XXXXXXXXXX', { 'anonymize_ip': true });
```

## الدعم

إذا واجهت أي مشكلة:
- Help Center: https://support.google.com/analytics
- Community: https://support.google.com/analytics/community
