# 前端开发规范

本文档记录了开发过程中常见的错误及最佳实践，供团队成员参考。

## TypeScript 规范

### 1. 可选链不能用于赋值表达式

❌ **错误写法**

```typescript
// TypeScript 报错：The left-hand side of an assignment expression may not be an optional property access.
imgRef.current?.style.backgroundImage = 'url(...)';
obj?.key = value;
```

✅ **正确写法**

```typescript
// 先检查是否存在，再进行赋值
if (imgRef.current) {
  imgRef.current.style.backgroundImage = 'url(...)';
}

// 或者使用明确的条件判断
if (obj) {
  obj.key = value;
}
```

**原因**：可选链 (`?.`) 可能返回 `undefined`，而赋值表达式的左侧必须是可写入的左值。

---

### 2. useRef 的类型定义

❌ **错误写法**

```typescript
const imgRef = useRef(null); // 类型推断为 React.RefObject<null>
```

✅ **正确写法**

```typescript
// 方式一：指定泛型类型
const imgRef = useRef<HTMLDivElement>(null);

// 方式二：指定初始值类型
const imgRef = useRef<HTMLDivElement | null>(null);
```

---

### 3. 可选属性访问 vs 赋值

❌ **错误写法**

```typescript
// 对可能不存在的属性进行赋值
obj?.prop = 'value';
arr?.[0] = 'value';
```

✅ **正确写法**

```typescript
// 先确保对象存在
if (obj) {
  obj.prop = 'value';
}

// 数组同理
if (arr && arr.length > 0) {
  arr[0] = 'value';
}
```

### 4. Ant Design List 组件 dataSource 必填默认值

❌ **错误写法**

```tsx
// 当 issues 为 undefined 时会报错
<List dataSource={issues} />
```

✅ **正确写法**

```tsx
// 始终提供默认值
<List dataSource={issues || []} />
```

**原因**：Ant Design 的 List 组件内部会尝试展开 dataSource，当为 undefined 或 null 时会抛出 "Invalid attempt to spread non-iterable instance" 错误。

### 5. Map/缓存获取值必做空值检查

❌ **错误写法**

```typescript
// Map.get() 可能返回 undefined
const issues = cacheIssues.get(repo);
// 后续直接使用 issues 可能报错
issues.filter(...);
```

✅ **正确写法**

```typescript
// 始终提供默认值
const issues = cacheIssues.get(repo) || [];
issues.filter(...);
```

---

## React 规范

### 1. useEffect 依赖数组

❌ **错误写法**

```typescript
// 缺少依赖项，导致闭包陷阱
useEffect(() => {
  const handler = () => console.log(count);
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []); // 缺少 count
```

✅ **正确写法**

```typescript
// 完整列出所有依赖
useEffect(() => {
  const handler = () => console.log(count);
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, [count]);
```

### 2. useRef vs useState

| 场景                 | 推荐 Hook  |
| -------------------- | ---------- |
| 不触发重新渲染的值   | `useRef`   |
| 需要触发重新渲染的值 | `useState` |
| 访问 DOM 元素        | `useRef`   |
| 表单输入值           | `useState` |

### 3. 组件Props类型定义

❌ **错误写法**

```typescript
interface Props {
  style: React.CSSProperties; // style 可能为 undefined
}
```

✅ **正确写法**

```typescript
// 明确指定必填属性
interface Props {
  style: React.CSSProperties;
}

// 或者指定默认值
const Component = ({ style = {}, children }) => {...};
```

---

## Next.js 规范

### 1. 客户端组件声明

需要在组件顶部使用 `'use client'` 指令来启用客户端功能：

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function ClientComponent() {
  // 可以使用 hooks
  const [state, setState] = useState(0);
  // ...
}
```

**何时使用**：

- 使用 `useState`、`useEffect`、`useRef` 等 Hooks
- 使用事件处理函数（onClick、onChange 等）
- 使用浏览器 API（localStorage、window 等）
- 使用第三方客户端库

### 2. 图片和静态资源

```typescript
// 推荐：使用公开目录
// public/images/logo.png 可以直接通过 /images/logo.png 访问

// 或者使用 getRoutePrefix() 获取基础路径
import { getRoutePrefix } from '@/utils/route';
const imagePath = `${getRoutePrefix()}/images/example.png`;
```

---

## 通用 JavaScript/TypeScript 规范

### 1. 空值合并运算符 `??` vs 逻辑或 `||`

```typescript
// ?? 只对 null/undefined 进行默认值处理
const a = null ?? 'default'; // 'default'
const b = 0 ?? 'default'; // 0
const c = '' ?? 'default'; // ''

// || 对所有假值（包括 0、''、false）进行默认值处理
const d = null || 'default'; // 'default'
const e = 0 || 'default'; // 'default'
const f = '' || 'default'; // 'default'
```

**推荐**：

- 使用 `??` 处理可能为 null/undefined 的值
- 使用 `||` 处理可能为假值（0、''、false）的值

### 2. 可选链 `?.` 的正确使用

✅ **适合使用可选链的场景**

```typescript
// 读取属性
const name = user?.profile?.name;
const firstItem = array?.[0];
const method = obj?.method?.();
```

❌ **不适合使用可选链的场景**

```typescript
// 赋值（会报错）
obj?.key = 'value';

// 作为赋值表达式的右侧是可以的
const value = obj?.key;
```

### 3. 类型守卫

```typescript
// 函数返回类型收窄
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function process(value: unknown) {
  if (isString(value)) {
    // TypeScript 知道 value 是 string
    console.log(value.toUpperCase());
  }
}
```

---

## 构建和开发

### 常用命令

```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 运行 lint
pnpm lint

# 类型检查
pnpm tsc
```

### 构建错误排查

1. **TypeScript 错误**：检查类型定义，确保可选属性使用正确
2. **ESLint 错误**：查看具体规则，按规范修改代码
3. **运行时错误**：检查控制台，使用 `pnpm dev` 进行调试

---

## 常见错误速查表

| 错误信息 | 解决方案 |
| --- | --- |
| `The left-hand side of an assignment expression may not be an optional property access` | 使用 `if` 检查后再赋值 |
| `Cannot read property 'xxx' of undefined` | 使用可选链 `?.` 读取 |
| `React Hook missing dependency` | 将依赖添加到依赖数组，或使用 `useCallback` |
| `Type 'undefined' is not assignable to type 'xxx'` | 提供默认值或明确类型 |

---

## 开发流程规范

### 完成任务后的验证要求

**重要**：每次修复 bug 或实现功能后，必须进行验证才能结束任务。

#### 验证步骤

1. **构建验证**

```bash
# 运行构建，确保无编译错误
pnpm build
```

2. **开发服务器验证**

```bash
# 启动开发服务器
pnpm dev

# 验证页面加载（检查返回状态码）
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# 预期输出: 200
```

3. **清理验证进程**

```bash
# 验证完成后关闭开发服务器
pkill -f "next dev" || true
```

#### 常见组件问题排查

| 问题场景                | 检查点                                       |
| ----------------------- | -------------------------------------------- | --- | ---- |
| List/Map/Array 组件报错 | 确保 `dataSource` 有默认值 `dataSource={data |     | []}` |
| 可选属性赋值报错        | 使用 `if (ref.current)` 包裹后再赋值         |
| 组件渲染失败            | 检查控制台错误，确保 props 类型正确          |

---

## GitHub Pages 部署规范

### 1. 环境变量配置

**本地开发**：在 `.env.local` 文件中配置 token

```bash
# .env.local（不会被提交到 git）
NEXT_PUBLIC_GITHUB_FRONTEND_TOKEN=your_token_here
NEXT_GITHUB_BACKED_TOKEN=your_token_here
```

**CI 构建**：在 workflow 中配置

```yaml
- name: 打包 🏗️
  env:
    # 使用 GITHUB_TOKEN（自动生成，不会被检测为 secret 泄露）
    NEXT_PUBLIC_GITHUB_FRONTEND_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NEXT_GITHUB_BACKED_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: pnpm run build && touch ./out/.nojekyll

- name: 删除本地环境变量文件
  run: rm -f .env.local # 确保不将本地 token 打包进去
```

### 2. Secret 泄露防护

- ✅ 使用 `GITHUB_TOKEN`（不会被 GitHub secret scanning 检测）
- ❌ 不要使用 `ghp_`、`gho_` 等开头的 Personal Access Token
- ✅ 构建前删除 `.env.local` 文件

### 3. 常见问题

| 问题                                     | 解决方案                                   |
| ---------------------------------------- | ------------------------------------------ |
| 推送被阻止 "Push cannot contain secrets" | 使用 `secrets.GITHUB_TOKEN` 替代手动 token |
| 401 Bad credentials                      | 检查 token 是否正确设置                    |
| 速率限制                                 | 使用 `GITHUB_TOKEN` 或等待 1 小时          |

---

## 相关资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [React 官方文档](https://react.dev/)
- [Next.js 官方文档](https://nextjs.org/docs)
- [ESLint 规则](https://eslint.org/docs/rules/)
