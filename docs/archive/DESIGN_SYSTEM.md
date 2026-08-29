# 🎨 سیستم طراحی پلتفرم KPI

## 🌟 Philosophy (فلسفه طراحی)

طراحی مینیمال و حرفه‌ای با رنگ‌های nude/neutral که:
- آرامش‌بخش و حرفه‌ای است
- تمرکز روی محتوا است
- قابل استفاده برای مدت طولانی
- مدرن و به‌روز است
- الهام از Awwwards و بهترین وب‌سایت‌های جهان

---

## 🎨 Color Palette (پالت رنگی)

### Primary Colors (رنگ‌های اصلی)
```css
/* Main Brand Colors */
--nude-50:   #faf8f5    /* خیلی روشن - پس‌زمینه‌ها */
--nude-100:  #f5f1eb    /* روشن - پس‌زمینه کارت‌ها */
--nude-200:  #e8e1d8    /* روشن‌تر - بوردرها */
--nude-300:  #d4c5b9    /* متوسط روشن - بوردر فعال */
--nude-400:  #b5a59a    /* متوسط - متن غیرفعال */
--nude-500:  #9b8b7e    /* اصلی - دکمه‌ها */
--nude-600:  #8a7a6f    /* تیره - hover */
--nude-700:  #6b5d54    /* خیلی تیره - متن */
--nude-800:  #4a3f38    /* سیاه - عناوین */
--nude-900:  #3d3530    /* سیاه‌تر - متن اصلی */
```

### Accent Colors (رنگ‌های تاکیدی)
```css
/* Success */
--success-light: #e8f5e9
--success:       #7cb89f
--success-dark:  #5a9179

/* Warning */
--warning-light: #fff8e1
--warning:       #d4a574
--warning-dark:  #b8834f

/* Error */
--error-light:   #ffebee
--error:         #c97b7b
--error-dark:    #a85555

/* Info */
--info-light:    #e3f2fd
--info:          #8ba3b5
--info-dark:     #6b8399
```

### Semantic Colors (رنگ‌های معنایی)
```css
--background:     #faf8f5
--surface:        #ffffff
--surface-hover:  #f5f1eb
--border:         #e8e1d8
--border-hover:   #d4c5b9

--text-primary:   #3d3530
--text-secondary: #6b5d54
--text-disabled:  #b5a59a

--shadow-sm:  0 1px 2px rgba(61, 53, 48, 0.05)
--shadow-md:  0 4px 6px rgba(61, 53, 48, 0.07)
--shadow-lg:  0 10px 15px rgba(61, 53, 48, 0.1)
--shadow-xl:  0 20px 25px rgba(61, 53, 48, 0.15)
```

---

## 📐 Typography (تایپوگرافی)

### Font Family
```css
font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Font Sizes
```css
--text-xs:   0.75rem   /* 12px */
--text-sm:   0.875rem  /* 14px */
--text-base: 1rem      /* 16px */
--text-lg:   1.125rem  /* 18px */
--text-xl:   1.25rem   /* 20px */
--text-2xl:  1.5rem    /* 24px */
--text-3xl:  1.875rem  /* 30px */
--text-4xl:  2.25rem   /* 36px */
--text-5xl:  3rem      /* 48px */
```

### Font Weights
```css
--font-light:      300
--font-normal:     400
--font-medium:     500
--font-semibold:   600
--font-bold:       700
--font-extrabold:  800
```

### Line Heights
```css
--leading-tight:   1.25
--leading-normal:  1.5
--leading-relaxed: 1.75
--leading-loose:   2
```

---

## 🔲 Spacing (فاصله‌گذاری)

### Spacing Scale
```css
--space-1:  0.25rem   /* 4px */
--space-2:  0.5rem    /* 8px */
--space-3:  0.75rem   /* 12px */
--space-4:  1rem      /* 16px */
--space-5:  1.25rem   /* 20px */
--space-6:  1.5rem    /* 24px */
--space-8:  2rem      /* 32px */
--space-10: 2.5rem    /* 40px */
--space-12: 3rem      /* 48px */
--space-16: 4rem      /* 64px */
--space-20: 5rem      /* 80px */
```

---

## 🔘 Border Radius (گوشه‌های گرد)

```css
--radius-sm:   0.375rem  /* 6px */
--radius-md:   0.5rem    /* 8px */
--radius-lg:   0.75rem   /* 12px */
--radius-xl:   1rem      /* 16px */
--radius-2xl:  1.5rem    /* 24px */
--radius-full: 9999px    /* دایره کامل */
```

---

## 🎭 Shadows (سایه‌ها)

```css
/* Soft, minimal shadows */
box-shadow: 
  /* Small */
  0 1px 2px rgba(61, 53, 48, 0.05);
  
  /* Medium */
  0 4px 6px -1px rgba(61, 53, 48, 0.07),
  0 2px 4px -1px rgba(61, 53, 48, 0.05);
  
  /* Large */
  0 10px 15px -3px rgba(61, 53, 48, 0.1),
  0 4px 6px -2px rgba(61, 53, 48, 0.05);
  
  /* Extra Large */
  0 20px 25px -5px rgba(61, 53, 48, 0.15),
  0 10px 10px -5px rgba(61, 53, 48, 0.08);
```

---

## 🎨 Component Styles (استایل کامپوننت‌ها)

### Buttons (دکمه‌ها)

#### Primary Button
```css
background: linear-gradient(135deg, #9b8b7e 0%, #8a7a6f 100%);
color: white;
padding: 0.75rem 1.5rem;
border-radius: 0.75rem;
box-shadow: 0 4px 6px rgba(155, 139, 126, 0.25);
transition: all 0.3s ease;

hover:
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(155, 139, 126, 0.35);
```

#### Secondary Button
```css
background: white;
color: #6b5d54;
border: 1.5px solid #d4c5b9;
padding: 0.75rem 1.5rem;
border-radius: 0.75rem;

hover:
  background: #faf8f5;
  border-color: #9b8b7e;
```

#### Ghost Button
```css
background: transparent;
color: #6b5d54;
padding: 0.75rem 1.5rem;

hover:
  background: #faf8f5;
```

### Cards (کارت‌ها)
```css
background: white;
border: 1px solid #e8e1d8;
border-radius: 1rem;
padding: 1.5rem;
box-shadow: 0 2px 4px rgba(61, 53, 48, 0.04);
transition: all 0.3s ease;

hover:
  border-color: #d4c5b9;
  box-shadow: 0 8px 16px rgba(61, 53, 48, 0.08);
  transform: translateY(-2px);
```

### Inputs (ورودی‌ها)
```css
background: #faf8f5;
border: 1.5px solid #e8e1d8;
border-radius: 0.75rem;
padding: 0.75rem 1rem;
color: #3d3530;

focus:
  background: white;
  border-color: #9b8b7e;
  ring: 0 0 0 3px rgba(155, 139, 126, 0.1);
  outline: none;
```

### Badges (برچسب‌ها)
```css
/* Success */
background: #e8f5e9;
color: #5a9179;
border: 1px solid #7cb89f;

/* Warning */
background: #fff8e1;
color: #b8834f;
border: 1px solid #d4a574;

/* Error */
background: #ffebee;
color: #a85555;
border: 1px solid #c97b7b;

/* Neutral */
background: #f5f1eb;
color: #6b5d54;
border: 1px solid #d4c5b9;
```

---

## 🏗️ Layout Components (کامپوننت‌های چیدمان)

### Sidebar
```css
background: white;
border-left: 1px solid #e8e1d8;
width: 280px;
box-shadow: 2px 0 8px rgba(61, 53, 48, 0.04);
```

### Navbar
```css
background: white;
border-bottom: 1px solid #e8e1d8;
height: 72px;
box-shadow: 0 1px 3px rgba(61, 53, 48, 0.04);
```

### Container
```css
max-width: 1440px;
margin: 0 auto;
padding: 0 2rem;
```

### Page Content
```css
background: #faf8f5;
min-height: 100vh;
padding: 2rem;
```

---

## ✨ Animations (انیمیشن‌ها)

### Transitions
```css
/* Default */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Fast */
transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

/* Slow */
transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
```

### Hover Effects
```css
/* Lift */
transform: translateY(-2px);

/* Scale */
transform: scale(1.02);

/* Grow */
transform: scale(1.05);
```

### Loading States
```css
/* Skeleton */
background: linear-gradient(
  90deg,
  #f5f1eb 0%,
  #e8e1d8 50%,
  #f5f1eb 100%
);
animation: shimmer 1.5s infinite;
```

---

## 📱 Responsive Breakpoints (نقاط شکست)

```css
/* Mobile First Approach */
--mobile:  0px      /* < 640px */
--sm:      640px    /* Tablet */
--md:      768px    /* Tablet Large */
--lg:      1024px   /* Desktop */
--xl:      1280px   /* Desktop Large */
--2xl:     1536px   /* Wide Screen */
```

---

## 🎯 Design Principles (اصول طراحی)

### 1. Simplicity (سادگی)
- حذف المان‌های غیرضروری
- تمرکز روی محتوا
- فضای سفید کافی

### 2. Consistency (ثبات)
- استفاده یکسان از رنگ‌ها
- spacing یکنواخت
- تایپوگرافی منسجم

### 3. Hierarchy (سلسله مراتب)
- سایزهای متنی واضح
- رنگ‌بندی معنادار
- وزن فونت مناسب

### 4. Accessibility (دسترسی‌پذیری)
- کنتراست رنگی بالا
- سایزهای لمسی مناسب
- keyboard navigation

### 5. Performance (عملکرد)
- انیمیشن‌های بهینه
- lazy loading
- optimized images

---

## 🎨 Usage Examples (مثال‌های کاربردی)

### Dashboard Card
```jsx
<div className="bg-white border border-nude-200 rounded-xl p-6 
                shadow-sm hover:shadow-md hover:border-nude-300 
                transition-all duration-300">
  <h3 className="text-xl font-semibold text-nude-900 mb-2">
    عنوان کارت
  </h3>
  <p className="text-nude-600 text-sm">
    توضیحات کارت
  </p>
</div>
```

### Primary Button
```jsx
<button className="bg-nude-500 hover:bg-nude-600 text-white 
                   font-medium px-6 py-3 rounded-xl shadow-lg 
                   shadow-nude-500/25 hover:shadow-nude-500/40 
                   transition-all duration-300 hover:-translate-y-0.5">
  دکمه اصلی
</button>
```

### Input Field
```jsx
<input className="w-full bg-nude-50 border-1.5 border-nude-200 
                  rounded-xl px-4 py-3 text-nude-900 
                  placeholder:text-nude-400
                  focus:bg-white focus:border-nude-500 
                  focus:ring-2 focus:ring-nude-500/20
                  transition-all" />
```

---

## 🎭 Dark Mode (حالت تاریک)

```css
/* در صورت نیاز */
--dark-bg:        #2d2520
--dark-surface:   #3d3530
--dark-border:    #4a3f38
--dark-text:      #f5f1eb
```

---

**✨ این سیستم طراحی پایه و اساس کل پلتفرم است!**

همه کامپوننت‌ها باید با این استانداردها سازگار باشند.

