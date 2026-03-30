# Hexlet Help Center website

Сайт документации Hexlet на [Docusaurus](https://docusaurus.io/).

## Пререквизиты

- ОС: Linux, macOS или Windows 10/11 (через WSL2).
- Node.js: `>= 20.0.0` (в CI используется Node `24`).
- Пакетный менеджер: `pnpm@10.30.0`.
- Corepack: нужен для активации зафиксированной версии `pnpm`.

Проверка окружения:

```bash
node -v
corepack --version
pnpm -v
```

## Установка и запуск

```bash
corepack enable
corepack prepare pnpm@10.30.0 --activate
pnpm install --frozen-lockfile
pnpm start
```

## Команды

```bash
pnpm run start
pnpm run build
pnpm run typecheck
pnpm run clear
```
