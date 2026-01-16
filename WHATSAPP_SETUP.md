# إعداد زر WhatsApp

## الخطوات المطلوبة

### 1. الحصول على رقم WhatsApp Business

**الخيار 1: استخدام رقمك الحالي**
- يمكنك استخدام رقم جوالك الحالي
- تأكد من أن WhatsApp مفعّل على هذا الرقم

**الخيار 2: إنشاء رقم WhatsApp Business**
- حمّل تطبيق **WhatsApp Business** (مجاني)
- iOS: https://apps.apple.com/app/whatsapp-business/id1386412985
- Android: https://play.google.com/store/apps/details?id=com.whatsapp.w4b
- سجّل رقم جوال مخصص للعمل

### 2. تحديث الكود

افتح ملف `client/src/components/WhatsAppButton.tsx` وابحث عن هذا السطر:

```typescript
const whatsappNumber = "966XXXXXXXXX";
```

استبدل `966XXXXXXXXX` برقم WhatsApp الخاص بك بالصيغة الدولية:

**صيغة الرقم:**
- **بدون** علامة `+` أو `00`
- **مع** رمز الدولة
- **بدون** مسافات أو شرطات

**أمثلة:**

**السعودية:**
- رقمك: `0501234567`
- الصيغة الصحيحة: `966501234567`

**مصر:**
- رقمك: `01012345678`
- الصيغة الصحيحة: `201012345678`

**الإمارات:**
- رقمك: `0501234567`
- الصيغة الصحيحة: `971501234567`

### 3. تخصيص الرسالة الافتراضية

في نفس الملف، ابحث عن:

```typescript
const defaultMessage = "مرحباً، أرغب في الاستفسار عن خدمات تشخيص صعوبات التعلم";
```

يمكنك تغيير هذه الرسالة لتناسب احتياجاتك:

```typescript
const defaultMessage = "مرحباً، أريد حجز موعد لتشخيص صعوبات التعلم";
```

أو

```typescript
const defaultMessage = "السلام عليكم، أرغب في معرفة المزيد عن خدماتكم";
```

### 4. كيف يعمل الزر

عند النقر على الزر:
1. يفتح WhatsApp تلقائياً (تطبيق أو ويب)
2. يبدأ محادثة مع رقمك
3. الرسالة الافتراضية تكون معبأة مسبقاً
4. المستخدم يضغط إرسال فقط

### 5. مميزات الزر

- ✅ **ثابت** في أسفل يسار الشاشة
- ✅ **متحرك** - يظهر النص عند التمرير
- ✅ **متجاوب** - يعمل على جميع الأجهزة
- ✅ **تتبع** - يسجل النقرات في Google Analytics
- ✅ **مجاني** - بدون تكاليف إضافية

### 6. تخصيص التصميم (اختياري)

**تغيير الموقع:**

في `WhatsAppButton.tsx`، غيّر:

```typescript
className="fixed bottom-6 left-6 ..."
```

إلى:

```typescript
className="fixed bottom-6 right-6 ..."  // أسفل اليمين
```

أو

```typescript
className="fixed top-6 left-6 ..."  // أعلى اليسار
```

**تغيير اللون:**

غيّر:

```typescript
className="... bg-green-500 hover:bg-green-600 ..."
```

إلى:

```typescript
className="... bg-blue-500 hover:bg-blue-600 ..."  // أزرق
```

أو

```typescript
className="... bg-indigo-600 hover:bg-indigo-700 ..."  // بنفسجي
```

**تغيير الحجم:**

غيّر:

```typescript
<MessageCircle className="w-6 h-6" />
```

إلى:

```typescript
<MessageCircle className="w-8 h-8" />  // أكبر
```

### 7. WhatsApp Business API (متقدم)

إذا كنت تريد ميزات متقدمة:

**WhatsApp Business API** يوفر:
- ✅ رسائل تلقائية (Automated messages)
- ✅ قوالب رسائل معتمدة (Message templates)
- ✅ تكامل مع CRM
- ✅ رسائل جماعية (Broadcast)
- ✅ تقارير وإحصائيات

**مزودو الخدمة:**
- **Twilio**: https://www.twilio.com/whatsapp
- **MessageBird**: https://messagebird.com/whatsapp
- **360dialog**: https://www.360dialog.com/
- **Infobip**: https://www.infobip.com/whatsapp

**التكلفة:**
- رسوم شهرية تبدأ من $50
- رسوم لكل رسالة (حسب المزود)

### 8. إضافة رسائل تلقائية (Quick Replies)

في WhatsApp Business، يمكنك إعداد:

**أ. رسالة ترحيب:**
- Settings → Business tools → Greeting message
- مثال: "مرحباً بك في تشخيصي! كيف يمكننا مساعدتك؟"

**ب. رسالة الغياب:**
- Settings → Business tools → Away message
- مثال: "شكراً لتواصلك. نحن حالياً خارج أوقات العمل. سنرد عليك في أقرب وقت."

**ج. ردود سريعة:**
- Settings → Business tools → Quick replies
- أضف ردود جاهزة للأسئلة الشائعة

### 9. تنظيم المحادثات

**استخدم Labels (التصنيفات):**
- New customer (عميل جديد)
- Booking request (طلب حجز)
- Follow-up (متابعة)
- Completed (مكتمل)

**استخدم Catalogs (الكتالوجات):**
- أضف خدماتك مع الأسعار
- يمكن للعملاء تصفح الخدمات داخل WhatsApp

### 10. قياس الأداء

**في Google Analytics:**
- Reports → Engagement → Events
- ابحث عن حدث `whatsapp_click`
- شاهد عدد النقرات على زر WhatsApp

**في WhatsApp Business:**
- Settings → Business tools → Statistics
- شاهد:
  - عدد الرسائل المرسلة
  - عدد الرسائل المستلمة
  - عدد الرسائل المقروءة
  - وقت الاستجابة

### 11. أفضل الممارسات

**أ. الرد السريع:**
- حاول الرد خلال 5 دقائق
- استخدم الردود السريعة للتوفير وقت

**ب. المهنية:**
- استخدم لغة احترافية
- أضف صورة profile واضحة
- املأ معلومات العمل كاملة

**ج. التوفر:**
- حدد ساعات العمل بوضوح
- فعّل رسالة الغياب خارج أوقات العمل

**د. الخصوصية:**
- لا تطلب معلومات حساسة عبر WhatsApp
- استخدم روابط آمنة للدفع

### 12. التكامل مع الفريق

إذا كان لديك فريق:

**الخيار 1: WhatsApp Business App**
- رقم واحد، جهاز واحد
- مناسب للشركات الصغيرة

**الخيار 2: WhatsApp Business API**
- رقم واحد، عدة مستخدمين
- يحتاج مزود خدمة
- مناسب للشركات المتوسطة والكبيرة

### 13. اختبار الزر

بعد تحديث الكود ونشره:

1. افتح الموقع على جهازك
2. ابحث عن الزر الأخضر في أسفل يسار الشاشة
3. اضغط عليه
4. يجب أن يفتح WhatsApp مع رسالتك المخصصة
5. أرسل رسالة تجريبية لنفسك

### 14. ملاحظات مهمة

- ✅ **مجاني تماماً** - بدون تكاليف
- ✅ **سهل الإعداد** - 2 دقيقة فقط
- ✅ **فعّال** - معدل استجابة عالي
- ✅ **مألوف** - الجميع يستخدم WhatsApp
- ⚠️ **يحتاج تحديث الرقم** في الكود
- ⚠️ **يحتاج متابعة** - رد سريع مهم

### 15. البدائل

إذا أردت استخدام قنوات أخرى:

**Telegram:**
```typescript
const url = `https://t.me/YOUR_USERNAME`;
```

**Facebook Messenger:**
```typescript
const url = `https://m.me/YOUR_PAGE_ID`;
```

**الاتصال المباشر:**
```typescript
const url = `tel:+966501234567`;
```

## الدعم

إذا واجهت أي مشكلة:
- WhatsApp Business Help: https://faq.whatsapp.com/
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp
