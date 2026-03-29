# Image Background Remover - MVP 需求文档

## 1. 产品定位

**产品名称**: Image Background Remover  
**产品类型**: AI 图像处理工具  
**核心价值**: 一键移除图片背景，无需注册即可使用  
**目标用户**: 设计师、电商卖家、内容创作者、需要快速处理图片背景的用户

---

## 2. 核心功能

| 功能 | 描述 |
|------|------|
| 图片上传 | 支持拖拽和点击上传 |
| AI 背景移除 | 调用 Remove.bg API 自动识别并移除背景 |
| 预览对比 | 展示原图和处理后图片对比 |
| 图片下载 | 一键下载透明背景 PNG |

---

## 3. 技术方案

| 类别 | 技术选型 |
|------|----------|
| 前端框架 | Next.js 14 |
| 部署平台 | Cloudflare Pages |
| AI API | Remove.bg |
| 图片处理 | 内存处理（不存储） |
| 样式方案 | Tailwind CSS |

**架构简图**:
```
用户 → Next.js 前端 → API 路由 → Remove.bg API → 返回结果 → 用户下载
```

---

## 4. 用户流程

### 主流程
1. 用户打开网站
2. 拖拽或点击选择图片
3. 点击"移除背景"按钮
4. 等待 AI 处理（显示加载动画）
5. 预览处理结果
6. 下载处理后的图片

### 异常处理
- 文件类型错误 → 提示"仅支持 PNG/JPG"
- 文件过大 → 提示"最大 10MB"
- API 调用失败 → 显示错误信息，支持重试

---

## 5. 界面设计

### 页面布局
```
┌─────────────────────────────────────┐
│            Header                   │
│  Logo + 标题                        │
├─────────────────────────────────────┤
│           Upload Area               │
│   拖拽上传区域 / 点击选择            │
├─────────────────────────────────────┤
│         Preview Area                │
│   原图        处理后               │
├─────────────────────────────────────┤
│           Actions                   │
│     [移除背景]  [下载] [重置]       │
├─────────────────────────────────────┤
│            Footer                   │
└─────────────────────────────────────┘
```

### 配色方案
- 主色: 蓝色 (#2563EB)
- 背景: 白色/浅灰
- 强调: 绿色 (#16A34A) 用于下载按钮

---

## 6. 开发计划

| 天数 | 任务 |
|------|------|
| Day 1 | 项目初始化 + UI 框架搭建 |
| Day 2 | 图片上传组件开发 |
| Day 3 | API 路由对接 Remove.bg |
| Day 4 | 预览和下载功能 |
| Day 5 | 部署上线 + 测试调优 |

---

## 7. 成本预估

| 项目 | 费用 |
|------|------|
| Remove.bg API | 免费额度 50 张/月 |
| Cloudflare Pages | 免费 |
| 域名 | 可选 (~$10/年) |
| **月成本** | **$0-10** |

---

## 8. 技术风险与应对

| 风险 | 应对方案 |
|------|----------|
| Remove.bg 免费额度用完 | 考虑付费套餐或切换其他 API |
| 大图片处理慢 | 前端显示加载状态，后端优化 |
| 隐私问题 | 纯内存处理，不存储任何图片 |
| Cloudflare 部署问题 | 备用 Vercel 部署方案 |

---

## 9. 代码参考

### API 路由示例
```typescript
// app/api/remove-bg/route.ts
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const image = formData.get("image") as File;
  
  // 调用 Remove.bg API
  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": process.env.REMOVE_BG_API_KEY },
    body: formData
  });
  
  return NextResponse.json({ result: ... });
}
```

### 前端上传组件
```tsx
// 支持拖拽 + 点击上传
<input type="file" accept="image/png,image/jpeg" />
```

---

## 10. 下一步

- [ ] 确认技术方案
- [ ] 准备 Remove.bg API Key
- [ ] 开始开发
