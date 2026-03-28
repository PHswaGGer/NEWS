# 아침 이메일로 받기 (토론토 기준 평일, 약 오전 8시)

웹페이지는 **직접 열었을 때만** 새로고침돼요. 매일 같은 시간에 메일로 받으려면 **GitHub Actions**(무료로 쓸 수 있는 경우가 많아요)와 **Resend**(메일 보내기 서비스)를 함께 쓰면 돼요.

## 1. Resend 준비

1. [resend.com](https://resend.com)에서 계정을 만들어요.
2. **도메인을 등록**하거나, 테스트용으로 본인 이메일만 보낼 수 있는 설정을 따라가요.
3. **API 키**를 만들어요.
4. **보내는 주소** 예: `아침신문 <digest@내도메인.com>` — Resend에서 허용된 주소여야 해요.

## 2. GitHub 저장소

`feeds.json`, `scripts/`, `.github/`가 들어 있는 **이 stock-news 폴더**를 Git 저장소로 만든 뒤 GitHub에 올려요.

## 3. GitHub 저장소 비밀 값 (Secrets)

저장소에서 **Settings → Secrets and variables → Actions → New repository secret**:

| 이름 | 넣을 내용 |
|------|-----------|
| `RESEND_API_KEY` | Resend에서 만든 `re_...` 키 |
| `DIGEST_FROM` | 예: `아침신문 <digest@내도메인.com>` |
| `DIGEST_TO` | 받을 이메일 (여러 개면 쉼표로 구분) |
| `RSS2JSON_API_KEY` | (선택) rss2json 유료/키 사용 시 |
| `DIGEST_MAX_HOURS` | (선택) 메일에 넣을 최근 시간(기본 36시간) |

캐나다 주택·모기지·감정 면은 **Google 뉴스 RSS**로 주제를 나눠 모으므로, rss2json에서 “API 키를 쓰라”는 안내가 나오면 키를 넣는 것이 좋아요.

## 4. 몇 시에 보내는지 (UTC 주의)

워크플로는 **평일 12:00 UTC**에 돌아가요. 대략 **캐나다 동부 일광절약시간(여름)** 에는 **오전 8시**에 가깝고, **동부 표준시(겨울)** 에는 **오전 7시**에 가까워질 수 있어요.

`.github/workflows/morning-digest.yml` 파일에서 `cron`을 바꿀 수 있어요.

- 여름에 8시에 맞추고 싶으면: `0 12 * * 1-5`
- 겨울에 8시에 더 맞추고 싶으면: `0 13 * * 1-5`

GitHub는 `America/Toronto` 같은 시간대 이름을 cron에 쓸 수 없어서, 계절에 맞게 숫자를 조절하면 돼요. **Actions** 탭에서 **workflow_dispatch**로 수동 실행해 테스트할 수도 있어요.

## 5. 내 컴퓨터에서 테스트

이 폴더에서:

```bash
npm run digest:dry
```

메일은 안 보내고, 글 개수와 HTML 크기만 확인해요.

실제로 한 통내려면 (PowerShell 예):

```powershell
$env:RESEND_API_KEY="re_..."
$env:DIGEST_FROM="아침신문 <확인된발신주소>"
$env:DIGEST_TO="내@이메일.com"
npm run digest
```

(Node.js가 설치되어 있어야 해요.)

## 6. rss2json이 막힐 때

피드가 비어 있거나 자주 실패하면 rss2json API 키를 쓰거나, GitHub Secrets에 `RSS2JSON_API_KEY`를 넣어 보세요. 웹에서는 필요하면 `config.js`로 `window.RSS2JSON_API_KEY`를 설정할 수 있어요(기본은 없음).
