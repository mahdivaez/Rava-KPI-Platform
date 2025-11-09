# 📍 Where to Find All Features - Navigation Guide

**Quick Reference**: Where everything is located in your platform

---

## 🧭 **MAIN NAVIGATION (Sidebar)**

### **For All Users** 👥

#### **Dashboard Section**
- **Main Dashboard** → Click "داشبورد" in sidebar
  - URL: `/dashboard`
  - Shows your workgroups, quick stats, and quick actions

- **Profile** → Click "پروفایل" in sidebar (NEW!)
  - URL: `/profile`
  - Upload profile picture
  - View your information

---

#### **Goals & Tasks Section** 🎯
- **My Goals** → Click "اهداف من" in sidebar (NEW!)
  - URL: `/goals`
  - See your personal goals
  - See team goals (from your workgroups)
  - See company goals
  - Track progress with visual bars

- **Tasks** → Click "وظایف" in sidebar (NEW!)
  - URL: `/tasks`
  - **For Writers**: See tasks assigned to you, mark as complete
  - **For Strategists**: Create tasks for writers, view status

---

#### **Evaluation Section** 📋
- **Strategist Evaluation** → Click "ارزیابی استراتژیست"
  - URL: `/evaluations/strategist`
  - Evaluate strategists (if you're Technical Deputy)

- **Writer Evaluation** → Click "ارزیابی نویسنده"
  - URL: `/evaluations/writer`
  - Evaluate writers (if you're a Strategist)

---

#### **Feedback Section** 💬 (Strategists Only)
- **Send Feedback** → Click "ارسال بازخورد"
  - URL: `/feedback/send`
  - Give feedback to strategists about writers

---

#### **Communications Section** 💌
- **Messages** → Click "پیام‌ها" in sidebar (NEW!)
  - URL: `/messages`
  - 💬 **DIRECT MESSAGING FEATURE IS HERE!**
  - Send messages to any user
  - See conversations list on the left
  - Chat interface on the right
  - Unread message badges

- **Leaderboard** → Click "جدول رتبه‌بندی" in sidebar (NEW!)
  - URL: `/leaderboard`
  - View rankings by points
  - See all-time leaders
  - See monthly leaders
  - View your rank

---

### **For Admins Only** 👑

#### **Management Section**

- **Analytics Dashboard** → Click "داشبورد تحلیلی" (NEW!)
  - URL: `/admin/dashboard`
  - Complete analytics overview
  - Performance comparison charts
  - Top performers
  - Activity metrics

- **Goals Management** → Click "اهداف" (NEW!)
  - URL: `/admin/goals`
  - Create goals for users (Individual Blogger, Individual Business)
  - Create goals for teams
  - Create company-wide goals
  - Track all goals progress
  - Delete/edit goals

- **Roles Editor** → Click "ویرایش نقش‌ها" (NEW!)
  - URL: `/admin/roles`
  - Toggle Admin status for users
  - Toggle Technical Deputy status
  - See all workgroup roles
  - Manage permissions

- **Users Management** → Click "کاربران"
  - URL: `/admin/users`
  - View all users
  - Create new users
  - Manage user details

- **Workgroups** → Click "کارگروه‌ها"
  - URL: `/admin/workgroups`
  - Create/manage workgroups
  - Add/remove members
  - Assign roles (Strategist/Writer)

- **Detailed Reports** → Click "گزارشات جزئی"
  - URL: `/admin/reports`
  - View all evaluations
  - View all feedback
  - Detailed breakdown

---

## 🔍 **HOW TO ACCESS FEATURES STEP-BY-STEP**

### **📧 How to Send Messages**
1. Look at the **right sidebar**
2. Find the section labeled **"ارتباطات"** (Communications)
3. Click on **"پیام‌ها"** with the 💬 icon
4. **OR** go directly to: `http://localhost:3000/messages`

**In the Messages Page:**
- **Left side**: List of conversations
- **Top**: Dropdown to start new conversation (select any user)
- **Center**: Chat messages
- **Bottom**: Type and send messages
- **Unread badges**: Red circles show unread count

---

### **🎯 How to View Your Goals**
1. Right sidebar → Look for **"اهداف و وظایف"** section
2. Click **"اهداف من"** with the 🎯 icon
3. **OR** go to: `http://localhost:3000/goals`

**You'll see:**
- Personal goals assigned to you
- Team goals (from your workgroups)
- Company goals
- Progress bars showing completion %
- Days remaining until deadline

---

### **✅ How to Manage Tasks**
1. Right sidebar → **"اهداف و وظایف"** section
2. Click **"وظایف"** with the 📋 icon
3. **OR** go to: `http://localhost:3000/tasks`

**For Writers:**
- See all tasks assigned to you
- Click "شروع وظیفه" to start a task
- Click "تکمیل وظیفه" ✅ to complete it

**For Strategists:**
- Click "وظیفه جدید" button (top right)
- Select writer, set priority, add description
- View all tasks you've created
- Monitor task status

---

### **🏆 How to View Leaderboard**
1. Right sidebar → **"ارتباطات"** section
2. Click **"جدول رتبه‌بندی"** with the 🏆 icon
3. **OR** go to: `http://localhost:3000/leaderboard`

**Features:**
- Your current rank and points (top card)
- Two tabs: "کل زمان‌ها" (All-time) and "این ماه" (This month)
- 🥇🥈🥉 Medals for top 3
- All users ranked by points

---

### **📸 How to Upload Profile Picture**
1. Right sidebar → Click **"پروفایل"**
2. **OR** go to: `http://localhost:3000/profile`
3. Click **"آپلود تصویر"** button
4. Select image (max 5MB)
5. Click "حذف تصویر" to remove it

---

### **⚙️ Admin: How to Create Goals**
1. Right sidebar → **"مدیریت"** section (Admin only)
2. Click **"اهداف"**
3. **OR** go to: `http://localhost:3000/admin/goals`
4. Click **"هدف جدید"** button (top right)
5. Fill out the form:
   - Select goal type (Individual/Team/Company)
   - Enter title and description
   - Set target value and unit
   - Set deadline
   - Assign to user or workgroup
6. Click "ایجاد هدف"

---

### **👥 Admin: How to Edit User Roles**
1. Right sidebar → **"مدیریت"** section
2. Click **"ویرایش نقش‌ها"**
3. **OR** go to: `http://localhost:3000/admin/roles`
4. **Toggle switches** to:
   - Make user an Admin (red switch)
   - Make user a Technical Deputy (brown switch)
5. See all workgroup roles for each user

---

## 🗺️ **COMPLETE URL MAP**

### **Public Pages**
- `/login` - Login page

### **User Pages**
- `/dashboard` - Main dashboard
- `/profile` - User profile (NEW!)
- `/goals` - My goals (NEW!)
- `/tasks` - Task management (NEW!)
- `/messages` - Direct messaging (NEW!)
- `/leaderboard` - Rankings (NEW!)
- `/evaluations/strategist` - Strategist evaluation form
- `/evaluations/writer` - Writer evaluation form
- `/feedback/send` - Send feedback (Strategist only)

### **Admin Pages**
- `/admin/dashboard` - Analytics dashboard (NEW!)
- `/admin/goals` - Goals management (NEW!)
- `/admin/roles` - Roles editor (NEW!)
- `/admin/users` - User management
- `/admin/workgroups` - Workgroup management
- `/admin/reports` - Detailed reports

---

## 🎨 **VISUAL GUIDE TO SIDEBAR**

```
┌─────────────────────────────┐
│   🎯 سیستم KPI              │
│   مدیریت عملکرد             │
├─────────────────────────────┤
│                             │
│  📊 داشبورد                 │
│  👤 پروفایل           [NEW] │
│                             │
│  ════ مدیریت ════  [ADMIN]  │
│  📈 داشبورد تحلیلی    [NEW] │
│  🎯 اهداف             [NEW] │
│  👥 کاربران                 │
│  ⚙️  ویرایش نقش‌ها    [NEW] │
│  📁 کارگروه‌ها              │
│  📊 گزارشات جزئی            │
│                             │
│  ════ اهداف و وظایف ════     │
│  🎯 اهداف من          [NEW] │
│  ✅ وظایف             [NEW] │
│                             │
│  ════ ارزیابی ════          │
│  📋 ارزیابی استراتژیست     │
│  📝 ارزیابی نویسنده        │
│                             │
│  ════ بازخورد ════          │
│  💬 ارسال بازخورد          │
│                             │
│  ════ ارتباطات ════          │
│  💌 پیام‌ها           [NEW] │
│  🏆 جدول رتبه‌بندی    [NEW] │
│                             │
└─────────────────────────────┘
```

---

## 💡 **QUICK TIPS**

### **To Send a Message:**
1. Click "پیام‌ها" in sidebar
2. Select user from dropdown at top
3. Type and send!

### **To Create a Goal (Admin):**
1. Click "اهداف" in Management section
2. Click "هدف جدید" button
3. Fill form and submit

### **To Assign a Task (Strategist):**
1. Click "وظایف" in sidebar
2. Click "وظیفه جدید" button
3. Select writer, add details
4. Submit!

### **To Complete a Task (Writer):**
1. Click "وظایف" in sidebar
2. Find your task
3. Click "شروع وظیفه" first
4. Then click "تکمیل وظیفه" ✅

---

## 🔔 **NOTIFICATIONS**

Look at the **top navbar** (header):
- 🔔 **Bell icon** - Notifications (placeholder for now)
- 💬 **Message icon** - Quick access to messages
- 👤 **User menu** - Profile, settings, logout

---

## ❓ **CAN'T FIND SOMETHING?**

**All new features are in the sidebar!**

Look for these new sections:
- **"اهداف و وظایف"** → Goals and Tasks
- **"ارتباطات"** → Messages and Leaderboard
- **"مدیریت"** → Admin features (if you're admin)

**OR** Just use the URLs directly:
- Messages: `/messages`
- Goals: `/goals`
- Tasks: `/tasks`
- Leaderboard: `/leaderboard`
- Profile: `/profile`

---

**🎉 Everything is ready to use! Just click and explore!** 🎉

