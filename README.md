
# 실시간 원자재 대시보드 (Real-time Commodity Dashboard)

**야후 파이낸스(Yahoo Finance) 데이터를 활용하여 주요 원자재의 실시간 시세와 고급 기술적 지표를 시각화하는 동적 웹 애플리케이션입니다.**

이 프로젝트는 사용자가 원자재 시장의 흐름을 한눈에 파악하고, 개별 자산에 대한 심층적인 기술적 분석을 수행할 수 있도록 설계되었습니다. 깔끔하고 반응형인 인터페이스를 통해 복잡한 금융 데이터를 직관적으로 이해할 수 있는 경험을 제공합니다.

실행주소1 : https://commodity-dashboard-bay.vercel.app/

실행주소2 : https://dev-canvas-pi.vercel.app/

---

## ✨ 주요 기능 (Key Features)

- **📈 실시간 대시보드**: 주요 원자재(원유, 금, 천연가스 등)의 현재 가격, 등락률, 미니 차트를 카드 형태로 제공합니다.
- **🎨 두 가지 보기 모드 (View Modes)**:
    - **카드 뷰(Card View)**: 개별 원자재의 상세 정보를 깔끔하게 보여줍니다.
    - **히트맵 뷰(Heatmap View)**: 전체 시장의 등락률과 거래 규모를 색상과 크기로 표현하여 시장 상황을 즉시 파악할 수 있습니다.
- **📊 상세 분석 페이지**:
    - **동적이고 상호작용 가능한 차트**: Recharts를 사용하여 부드러운 차트 경험을 제공합니다.
    - **다중 원자재 비교**: 여러 원자재를 한 차트에 추가하여 정규화된(normalized) 수익률을 비교할 수 있습니다.
    - **다양한 시간 범위 선택**: 1일부터 5년까지 원하는 기간의 데이터를 조회할 수 있습니다.
- **🛠️ 고급 기술적 지표**:
    - **가격 오버레이 지표**:
        - 이동평균선 (MA: 5일, 20일)
        - 볼린저 밴드 (Bollinger Bands)
    - **별도 하단 차트 지표**:
        - 상대강도지수 (RSI)
        - 이동평균 수렴확산 지수 (MACD)
        - 거래량 (Volume)
    - **지능형 UI**: 다중 원자재 비교 시에는 기술적 지표가 자동으로 비활성화되어 명확한 비교 분석에 집중할 수 있습니다.
- **🔄 자동 데이터 갱신**: 대시보드의 데이터는 1분마다 자동으로 새로고침되어 항상 최신 정보를 유지합니다.
- **📱 반응형 디자인**: 데스크톱, 태블릿, 모바일 등 모든 기기에서 최적화된 화면을 제공합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

- **프론트엔드**: React, TypeScript
- **상태 관리**: React Hooks (`useState`, `useEffect`, `useCallback`)
- **스타일링**: Tailwind CSS
- **차트 라이브러리**: Recharts
- **데이터 소스**: [Yahoo Finance API](https://finance.yahoo.com/)
- **CORS 해결**: [corsproxy.io](https://corsproxy.io/) 를 이용한 프록시 서버
- **모듈 로딩**: `index.html` 내 `importmap`을 사용하여 CDN([esm.sh](https://esm.sh/))에서 직접 모듈을 로드 (별도 빌드 과정 없음)

---

## 📂 프로젝트 구조

프로젝트는 기능별로 명확하게 분리된 컴포넌트 기반 아키텍처를 따릅니다.

```
/
├── public/
├── src/
│   ├── components/
│   │   ├── DashboardView.tsx     # 메인 대시보드 화면
│   │   ├── DetailView.tsx        # 상세 분석 화면
│   │   ├── PriceChart.tsx        # 핵심 가격 차트 컴포넌트
│   │   ├── KeyMetrics.tsx        # 주요 지표 표시
│   │   ├── CommoditySelector.tsx # 원자재 선택 UI
│   │   ├── IndicatorSelector.tsx # 기술적 지표 선택 UI
│   │   ├── CommodityCard.tsx     # 대시보드 카드 UI
│   │   ├── HeatmapTile.tsx       # 대시보드 히트맵 타일 UI
│   │   ├── ... (기타 UI 컴포넌트)
│   │
│   ├── services/
│   │   └── yahooFinanceService.ts # Yahoo Finance API 연동 로직
│   │
│   ├── utils/
│   │   └── technicalIndicators.ts # SMA, RSI, BB, MACD 등 지표 계산 함수
│   │
│   ├── App.tsx                 # 애플리케이션 메인 라우팅 로직
│   ├── index.tsx               # React 앱 진입점
│   ├── types.ts                # 전역 TypeScript 타입 정의
│   └── constants.ts            # 원자재 목록, 색상 등 상수
│
├── index.html                  # HTML 진입점 및 importmap 설정
├── metadata.json               # 프로젝트 메타데이터
└── README.md                   # 프로젝트 설명 파일
```

---

## 🚀 로컬에서 실행하기 (Getting Started)

이 프로젝트는 별도의 빌드 과정이나 복잡한 설정이 필요 없습니다. 간단한 로컬 웹 서버만 있으면 바로 실행할 수 있습니다.

1.  **프로젝트 클론 또는 다운로드**:
    ```bash
    git clone https://your-repository-url.git
    cd your-project-directory
    ```

2.  **로컬 웹 서버 실행**:
    프로젝트의 루트 디렉토리에서 아래 방법 중 하나를 선택하여 웹 서버를 실행합니다.

    - **VS Code의 Live Server 확장 프로그램 사용**:
        - [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 확장 프로그램을 설치합니다.
        - `index.html` 파일을 우클릭하고 "Open with Live Server"를 선택하거나, 에디터 우측 하단의 "Go Live" 버튼을 클릭합니다.

    - **Python 사용 (Python 3 설치 필요)**:
        ```bash
        python -m http.server
        ```
        - 브라우저에서 `http://localhost:8000`으로 접속합니다.

    - **Node.js의 `serve` 패키지 사용**:
        ```bash
        npx serve
        ```
        - 터미널에 표시되는 주소(예: `http://localhost:3000`)로 접속합니다.

3.  **브라우저에서 확인**:
    웹 서버가 실행되면 지정된 주소로 접속하여 애플리케이션을 확인할 수 있습니다.

---

## 🔮 향후 개선 아이디어 (Future Ideas)

- **사용자 지정 가격 알림**: 사용자가 특정 원자재의 목표 가격을 설정하고, 도달 시 브라우저 푸시 알림을 받는 기능.
- **차트 드로잉 도구**: 차트에 직접 추세선, 지지/저항선, 피보나치 되돌림 등을 그릴 수 있는 분석 도구 추가.
- **개인화 포트폴리오**: 사용자가 관심 있는 원자재만 모아 '관심 목록'을 만들고 관리하는 기능.
- **AI 기반 자동 분석 (Gemini API 연동)**: "AI 분석" 버튼을 추가하여, 현재 차트의 기술적 지표를 종합적으로 해석하고 투자 요약 리포트를 생성해주는 기능.
- **사용자 설정 저장**: `localStorage`를 활용하여 마지막에 본 화면, 선택한 지표 등을 저장하여 재방문 시 사용자 경험을 향상.
