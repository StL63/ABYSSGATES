import React, { useState, useEffect, useRef } from 'react';

type RecordStatusType = 'ACTIVE' | 'DECEASED' | 'RESET' | 'RELEASED' | 'MISSING';
interface ParticipantRecord {
  id: string;
  statusType: RecordStatusType;
  activeNum: number;
  deathCount: number;
}

const generateInitialRecords = (): ParticipantRecord[] => {
  const groups: ParticipantRecord[][] = [];
  for (let i = 0; i < 63; i++) {
    const idNum = Math.floor(Math.random() * 999) + 1;
    const id = `P-${idNum.toString().padStart(3, '0')}`;

    const rand = Math.random();
    if (rand < 0.65) {
      groups.push([{ id, statusType: 'DECEASED', activeNum: 0, deathCount: Math.floor(Math.random() * 31) + 20 }]);
    } else if (rand < 0.75) {
      groups.push([{ id, statusType: 'MISSING', activeNum: 0, deathCount: Math.floor(Math.random() * 44) + 7 }]);
    } else if (rand < 0.80) {
      groups.push([{ id, statusType: 'RELEASED', activeNum: 20, deathCount: Math.floor(Math.random() * 29) + 22 }]);
    } else if (rand < 0.85) {
      const deathCount = Math.floor(Math.random() * 29) + 22;
      groups.push([
        { id, statusType: 'RESET', activeNum: 20, deathCount },
        { id, statusType: 'ACTIVE', activeNum: 1, deathCount }
      ]);
    } else {
      groups.push([{ id, statusType: 'ACTIVE', activeNum: Math.floor(Math.random() * 19) + 1, deathCount: Math.floor(Math.random() * 50) + 1 }]);
    }
  }

  // Shuffle the groups so RELEASED aren't always at the top, but pairs stay together
  for (let i = groups.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [groups[i], groups[j]] = [groups[j], groups[i]];
  }

  const records: ParticipantRecord[] = [];
  for (const group of groups) {
    records.push(...group);
  }

  return records;
};

const SECRET_CODE = "00";

const LOADING_MESSAGES = [
  "> INITIALIZING...",
  "> ACCESSING IMAGE DATABASE...",
  "> LOADING RENDER ENGINE...",
  "> GENERATING OUTPUT...",
  "> COMPLETE"
];

const SESSION_LOG_MESSAGES = [
  { en: "Initializing data integrity check...", ko: "검사 시작..." },
  { en: "Checking data integrity...", ko: "데이터 무결성 검사 중..." },
  { en: "Verifying records...", ko: "기록 검증 중..." },
  { en: "ERROR: DATA CORRUPTION DETECTED", ko: "오류: 데이터 손상 감지", isError: true },
  { en: "Attempting recovery...", ko: "복구 시도 중..." },
  { en: "Integrity check failed.", ko: "데이터 무결성 검사 실패", isError: true },
  { en: "Partial access granted.", ko: "일부 기록만 접근 가능합니다." }
];

const TypewriterText = ({ text, onComplete }: { text: string, onComplete?: () => void }) => {
  const [displayed, setDisplayed] = useState('');
  const onCompleteRef = useRef(onComplete);
  
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, 20);
    return () => clearInterval(timer);
  }, [text]);
  
  return <span>{displayed}</span>;
};

const LogMessage: React.FC<{ msg: any, isRecovery?: boolean, stopDots?: boolean }> = ({ msg, isRecovery, stopDots }) => {
  const [step, setStep] = useState(0);
  const [dots, setDots] = useState('.');

  useEffect(() => {
    if (isRecovery && step === 2 && !stopDots) {
      const timer = setInterval(() => {
        setDots(prev => prev.length >= 4 ? '.' : prev + '.');
      }, 400);
      return () => clearInterval(timer);
    }
  }, [isRecovery, step, stopDots]);

  const baseEn = isRecovery ? msg.en.replace('...', '') : msg.en;
  const baseKo = isRecovery ? msg.ko.replace('...', '') : msg.ko;

  return (
    <div className={msg.isError ? "text-red-500 font-bold" : ""}>
      <p>
        <TypewriterText text={baseEn} onComplete={() => setStep(msg.ko ? 1 : 2)} />
        {isRecovery && step === 2 && <span>{dots}</span>}
      </p>
      {step >= 1 && msg.ko && (
        <p className="opacity-80">
          <TypewriterText text={baseKo} onComplete={() => setStep(2)} />
          {isRecovery && step === 2 && <span>{dots}</span>}
        </p>
      )}
    </div>
  );
};

const CLOSED_SESSION_LOGS = [
  {
    id: "#00",
    name: "██:재미없는 놈",
    unlockedName: "무결점:재미없는 놈",
    code: "███",
    unlockedCode: "N00",
    tier: "SSR",
    condition: "누적  ██ 횟수 █회 상태로 최종 관문 통과.",
    unlockedCondition: "누적 사망 횟수 ‘0’회 상태로 최종 관문 통과.",
    analysis: "이론상으로만 존재하는  ██. 달성 시 특별 프로토콜 '████'이 활성화되는 것으로 추정되나, 현재까지 실제 달성  ██이 없어 데이터 확인 불가.",
    unlockedAnalysis: "이론상으로만 존재하는  분기. 달성 시 특별 프로토콜 '무결점'이 활성화되는 것으로 추정되나, 현재까지 실제 달성 기록이 없어 데이터 확인 불가.",
    extra: [
      "관련 데이터 조각: 시스템 내에서 발견된  ██ 불명의 손상된 기록. 이하 내용 외 ██ 불가.",
      "[███의 비석] : 흠결 없는 자는 ███의 ██을 얻으리라."
    ],
    unlockedExtra: [
      "관련 데이터 조각: 시스템 내에서 발견된 출처 불명의 손상된 기록. 이하 내용 외 해독 불가.",
      "[███의 비석] : 흠결 없는 자는 ███의 ██을 얻으리라."
    ],
    unlockCode: "N00",
    imageUrl: "https://raw.githubusercontent.com/StL63/A/main/AG/N00.png"
  },
  {
    id: "#01",
    name: "탈출의 ██",
    unlockedName: "탈출의 종점",
    code: "███",
    unlockedCode: "R01",
    tier: "SSR",
    condition: "20번 관문, '█' 선택.",
    unlockedCondition: "20번 관문, 선택지 'D' 선택.",
    analysis: "█, █, █ 외에 존재하는 ███ 프로토콜. 시스템의 설계상 ██을 이용한 유일한 █ █.",
    unlockedAnalysis: "A, B, C 외에 존재하는 탈출 프로토콜. 시스템의 설계상 허점을 이용한 유일한 정상 탈출 루트.",
    unlockCode: "R01",
    imageUrl: "https://raw.githubusercontent.com/StL63/A/main/AG/R01.png"
  },
  {
    id: "#02",
    name: "재능의 ██",
    unlockedName: "재능의 증명",
    code: "███",
    unlockedCode: "K02",
    tier: "SR",
    condition: "누적 █ 횟수 ██회 초과.",
    unlockedCondition: "누적 사망 횟수 50회 초과.",
    analysis: "참가자의 누적된 █가 특정 ███를 초과할 경우, 시스템이 참가자의 '가치 없음'을 판정하고 강제적으로 ████를 종료시키는 프로토콜.",
    unlockedAnalysis: "참가자의 누적된 실패가 특정 임계치를 초과할 경우, 시스템이 참가자의 '가치 없음'을 판정하고 강제적으로 세션게이트를 종료시키는 프로토콜.",
    unlockCode: "K02",
    imageUrl: "https://raw.githubusercontent.com/StL63/A/main/AG/K02.png"
  },
  {
    id: "#03",
    name: "영원한 ██",
    unlockedName: "영원한 관객",
    code: "███",
    unlockedCode: "E03",
    tier: "SR",
    condition: "20번 관문, '█' 선택.",
    unlockedCondition: "20번 관문, 선택지 ‘B' 선택.",
    analysis: "참가자를 시스템의 '██' 데이터베이스로 ██. 육체는 ██되나, 의식은 다른 참가자들의 플레이를 영원히 ████는 '██ 데이터'의 일부가 됨.",
    unlockedAnalysis: "참가자를 시스템의 '관람객' 데이터베이스로 편입. 육체는 소멸되나, 의식은 다른 참가자들의 플레이를 영원히 지켜보는 '관측 데이터'의 일부가 됨.",
    unlockCode: "E03",
    imageUrl: "https://raw.githubusercontent.com/StL63/A/main/AG/E03.png"
  },
  {
    id: "#04",
    name: "완벽한 ██",
    unlockedName: "완벽한 배신",
    code: "███",
    unlockedCode: "Y04",
    tier: "R",
    condition: "20번 관문, '█' 선택.",
    unlockedCondition: "20번 관문, 선택지 ‘A' 선택.",
    analysis: "가장 매력적인 ████를 제시하여 ██. ██ 직전, 모든 데이터를 소거하고 참가자의 존재 기록 자체를 ███하는 '메모리 ██' 프로토콜 실행.",
    unlockedAnalysis: "가장 매력적인 탈출 시나리오를 제시하여 참가자를 유인. 희망을 갖기 직전, 모든 데이터를 소거하고 참가자의 존재 기록 자체를 파기하는 '메모리 청소' 프로토콜 실행.",
    unlockCode: "Y04",
    imageUrl: "https://raw.githubusercontent.com/StL63/A/main/AG/Y04.png"
  },
  {
    id: "#05",
    name: "제자리 ██",
    unlockedName: "제자리 걸음",
    code: "███",
    unlockedCode: "B05",
    tier: "R",
    condition: "20번 관문, '█' 선택.",
    unlockedCondition: "20번 관문, 선택지 'C' 선택.",
    analysis: "참가자의 모든 진행 기록을 ██한 채, 스테이지 변수만 '█'로 ███. 참가자의 ██을 극대화하기 위해 설계된 ███ 루프.",
    unlockedAnalysis: "참가자의 모든 진행 기록을 보존한 채, 스테이지 변수만 '1'로 초기화. 플레이어의 허탈감을 극대화하기 위해 설계된 무한 루프.",
    unlockCode: "B05",
    imageUrl: "https://raw.githubusercontent.com/StL63/A/main/AG/B05.png"
  },
  {
    id: "#06",
    name: "█ 그게 ████",
    unlockedName: "고작 그게 네 결말?",
    code: "███",
    unlockedCode: "J06",
    tier: "N",
    condition: "시스템이 제시하는 ██ 외의 자발적 ███ 시도.",
    unlockedCondition: "시스템이 제시하는 탈출 외의 자발적 포기(자살 등) 시도.",
    analysis: "참가자의 '자유의지'를 가장 무█하게 만드는 ██. 어떠한 기록이나 성과도 남기지 않고 즉시 ██ 처리.",
    unlockedAnalysis: "참가자의 '자유의지'를 가장 무가치하게 만드는 루트. 어떠한 기록이나 성과도 남기지 않고 즉시 소멸 처리.",
    unlockCode: "J06",
    imageUrl: "https://raw.githubusercontent.com/StL63/A/main/AG/J06.png"
  },
  {
    id: "#07",
    name: "██",
    unlockedName: "공백",
    code: "███",
    unlockedCode: "S07",
    tier: "N",
    condition: "단일 스테이지에서 █턴 이상 유의미한 행동 부재.",
    unlockedCondition: "단일 스테이지에서 5턴 이상 유의미한 행동 부재.",
    analysis: "██ 의사가 ██ 참가자로 판정, 시스템 리소스 확보를 위해 해당 세션을 '███ 데이터'로 처리하고 연결을 차단.",
    unlockedAnalysis: "진행 의사가 없는 참가자로 판정, 시스템 리소스 확보를 위해 해당 세션을 '유령 데이터'로 처리하고 연결을 차단.",
    unlockCode: "S07",
    imageUrl: "https://raw.githubusercontent.com/StL63/A/main/AG/S07.png"
  },
  {
    id: "#08",
    name: "██이탈",
    unlockedName: "배역이탈",
    code: "███",
    unlockedCode: "P08",
    tier: "N",
    condition: "███ ██을 해치는 ██ █회 이상 누적.",
    unlockedCondition: "진행을 해치는 도움 요청 3회 이상 누적.",
    analysis: "'참가자'라는 ██을 망각한 ██에 대한 자격 박탈. 시스템의 █번째 벽을 보호하기 위한 보안 프로토콜.",
    unlockedAnalysis: "'참가자'라는 역할을 망각한 데이터에 대한 자격 박탈. 시스템의 4번째 벽을 보호하기 위한 보안 프로토콜.",
    unlockCode: "P08",
    imageUrl: "https://raw.githubusercontent.com/StL63/A/main/AG/P08.png"
  },
  {
    id: "#09",
    name: "██ 데이터",
    unlockedName: "손상된 데이터",
    code: "███",
    unlockedCode: "F09",
    tier: "N",
    condition: "지정된 █ ██에서 ██ 저장 시도.",
    unlockedCondition: "지정된 체크포인트에서 중복 저장 시도.",
    analysis: "██ ██가 데이터의 물리적 ██을 유발한다는 시스템 ██을 이용한 함정. 참가자의 ████이 스스로를 ██하게 만듦.",
    unlockedAnalysis: "과도한 덮어쓰기가 데이터의 물리적 손상을 유발한다는 시스템 설정을 이용한 함정. 참가자의 오만함이 스스로를 파괴하게 만듦.",
    unlockCode: "F09",
    imageUrl: "https://raw.githubusercontent.com/StL63/A/main/AG/F09.png"
  }
];

const DASHBOARD_LINKS = [
  "OBSERVER RIES",
  "OBSERVER RIES 19",
  "참가자 기록",
  "종료된 세션 로그"
];

const RIES_BASIC_IMAGES = [
  "https://raw.githubusercontent.com/StL63/A/main/AG/Z01.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/Z02.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/Z03.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/Z04.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/Z05.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/Z06.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/Z07.png"
];

const RIES_NOT_FOUND_IMAGES = [
  "https://raw.githubusercontent.com/StL63/A/main/AG/01.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/02.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/03.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/04.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/05.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/06.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/07.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/08.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/09.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/10.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/11.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/12.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/13.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/14.png"
];

const RIES_19_NOT_FOUND_IMAGES = [
  "https://raw.githubusercontent.com/StL63/A/main/AG/15.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/16.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/17.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/18.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/19.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/20.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/21.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/22.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/23.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/24.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/25.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/26.png",
  "https://raw.githubusercontent.com/StL63/A/main/AG/27.png"
];

export default function App() {
  const [phase, setPhase] = useState<'LOGIN' | 'LOADING' | 'GRANTED' | 'DASHBOARD' | 'PAGE'>('LOGIN');
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [currentPage, setCurrentPage] = useState('');
  const [participants, setParticipants] = useState<ParticipantRecord[]>(() => generateInitialRecords());
  const [sessionLogPhase, setSessionLogPhase] = useState<'CHECKING' | 'RESULT'>('CHECKING');
  const [sessionLogStep, setSessionLogStep] = useState(0);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [unlockedLogs, setUnlockedLogs] = useState<string[]>([]);
  const [hasViewedSessionLogs, setHasViewedSessionLogs] = useState(false);
  const [isBasicExpanded, setIsBasicExpanded] = useState(false);
  const [isNotFoundExpanded, setIsNotFoundExpanded] = useState(false);
  const [isWarningExpanded, setIsWarningExpanded] = useState(false);
  const [hasBasicBeenClicked, setHasBasicBeenClicked] = useState(false);
  const [showLockMessage, setShowLockMessage] = useState(false);
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);

  const handleCodeSubmit = () => {
    const activeLog = CLOSED_SESSION_LOGS.find(log => log.id === activeLogId);
    if (activeLog && codeInput.toUpperCase() === activeLog.unlockCode) {
      if (activeLogId) {
        setUnlockedLogs(prev => [...prev, activeLogId]);
      }
      setShowCodeInput(false);
      setShowImageModal(true);
      setCodeError(false);
      setCodeInput("");
    } else {
      setCodeError(true);
      setCodeInput("");
    }
  };
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setParticipants(prev => {
        const nextRecords: ParticipantRecord[] = [];
        for (const p of prev) {
          if (p.statusType !== 'ACTIVE') {
            nextRecords.push(p);
            continue;
          }

          if (p.activeNum >= 20) {
            const rand = Math.random();
            if (rand < 0.02) { // 2% 
              nextRecords.push({ ...p, statusType: 'RELEASED', activeNum: 20 });
            } else if (rand < 0.22) { // 20%
              nextRecords.push({ ...p, statusType: 'RESET', activeNum: 20 });
              nextRecords.push({ ...p, statusType: 'ACTIVE', activeNum: 1 });
            } else { // 78%
              nextRecords.push({ ...p, statusType: 'DECEASED', activeNum: 0 });
            }
          } else {
            const rand = Math.random();
            if (rand < 0.6) { // 60% chance to progress
              nextRecords.push({ ...p, activeNum: p.activeNum + 1 });
            } else if (rand < 0.95) { // 35% chance to die and restart chapter
              let newActive = p.activeNum;
              if (p.activeNum >= 1 && p.activeNum <= 5) newActive = 1;
              else if (p.activeNum >= 6 && p.activeNum <= 10) newActive = 5;
              else if (p.activeNum >= 11 && p.activeNum <= 15) newActive = 10;
              else if (p.activeNum >= 16 && p.activeNum <= 19) newActive = 15;

              nextRecords.push({ ...p, activeNum: newActive, deathCount: p.deathCount + 1 });
            } else { // 5% chance immediate death
              nextRecords.push({ ...p, statusType: 'DECEASED', activeNum: 0 });
            }
          }
        }
        return nextRecords;
      });
    }, 10000); // 10 seconds

    const addInterval = setInterval(() => {
      const idNum = Math.floor(Math.random() * 999) + 1;
      const id = `P-${idNum.toString().padStart(3, '0')}`;
      
      const rand = Math.random();
      if (rand < 0.65) {
        setParticipants(prev => [...prev, { id, statusType: 'DECEASED', activeNum: 0, deathCount: Math.floor(Math.random()*31) + 20 }]);
      } else if (rand < 0.75) {
        // Since we want new ones to also have high death count for missing
        setParticipants(prev => [...prev, { id, statusType: 'MISSING', activeNum: 0, deathCount: Math.floor(Math.random()*44) + 12 }]);
      } else if (rand < 0.8) {
        setParticipants(prev => [...prev, { id, statusType: 'RELEASED', activeNum: 20, deathCount: Math.floor(Math.random()*29) + 22 }]);
      } else if (rand < 0.85) {
        const deathCount = Math.floor(Math.random() * 29) + 22;
        setParticipants(prev => [
            ...prev,
            { id, statusType: 'RESET', activeNum: 20, deathCount },
            { id, statusType: 'ACTIVE', activeNum: 1, deathCount }
        ]);
      } else {
        setParticipants(prev => [...prev, { id, statusType: 'ACTIVE', activeNum: 1, deathCount: 0 }]);
      }
    }, 30000); // 30 seconds

    return () => {
      clearInterval(updateInterval);
      clearInterval(addInterval);
    };
  }, []);

  useEffect(() => {
    if (phase === 'LOGIN' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'PAGE' && currentPage === '종료된 세션 로그' && sessionLogPhase === 'CHECKING') {
      if (sessionLogStep < SESSION_LOG_MESSAGES.length + 1) {
        if (sessionLogStep === 5) return; // Pause for user interaction
        
        let delay = 3500;
        if (sessionLogStep === 4) delay = 1500;
        else if (sessionLogStep === 6) delay = 5500;
        else if (sessionLogStep > 6) delay = 1500;
        
        const timer = setTimeout(() => {
          setSessionLogStep(prev => prev + 1);
        }, delay);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setSessionLogPhase('RESULT');
          setHasViewedSessionLogs(true);
        }, 2000); // Wait 2s before transitioning
        return () => clearTimeout(timer);
      }
    }
  }, [phase, currentPage, sessionLogPhase, sessionLogStep]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode === SECRET_CODE) {
      setError(false);
      setPhase('LOADING');
    } else {
      setError(true);
      setInputCode('');
    }
  };

  useEffect(() => {
    if (phase === 'LOADING') {
      if (loadingStep < LOADING_MESSAGES.length) {
        const timer = setTimeout(() => {
          setLoadingStep(prev => prev + 1);
        }, 800); // 800ms per step
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setPhase('GRANTED');
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, loadingStep]);

  useEffect(() => {
    if (phase === 'GRANTED') {
      const timer = setTimeout(() => {
        setPhase('DASHBOARD');
      }, 3000); // Show granted for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleLinkClick = (link: string) => {
    if (link === 'OBSERVER RIES 19' && !unlockedLogs.includes('#04')) {
      setShowLockMessage(true);
      setTimeout(() => setShowLockMessage(false), 2000);
      return;
    }
    setCurrentPage(link);
    if (link === '종료된 세션 로그') {
      if (hasViewedSessionLogs) {
        setSessionLogPhase('RESULT');
      } else {
        setSessionLogPhase('CHECKING');
        setSessionLogStep(1);
      }
    }
    setPhase('PAGE');
  };

  const numMessages = sessionLogStep <= 4 ? sessionLogStep : sessionLogStep - 1;

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-6 selection:bg-green-900 selection:text-green-100">
      {phase === 'LOGIN' && (
        <div className="max-w-3xl mx-auto mt-10">
          <p className="mb-1">RESTRICTED SYSTEM ACCESS</p>
          <p className="mb-6">제한된 시스템 접근</p>
          
          <p className="mb-1">ADMIN PRIVILEGES REQUIRED</p>
          <p className="mb-6">관리자 권한 필요</p>
          
          <p className="mb-6">----------------------------------------</p>
          
          <p className="mb-1">Please enter an administrator code.</p>
          <p className="mb-6">관리자 코드를 입력하세요.</p>
          
          <form onSubmit={handleLoginSubmit} className="flex items-center">
            <span className="mr-2">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="bg-transparent outline-none border-none text-green-500 flex-1 caret-green-500"
              autoFocus
              autoComplete="off"
              spellCheck="false"
            />
          </form>
          {error && (
            <p className="text-red-500 mt-4">Incorrect code. Access denied.</p>
          )}
        </div>
      )}

      {phase === 'LOADING' && (
        <div className="max-w-3xl mx-auto mt-10 flex flex-col gap-2">
          {LOADING_MESSAGES.slice(0, loadingStep).map((msg, idx) => (
            <p key={idx}>{msg}</p>
          ))}
          {loadingStep < LOADING_MESSAGES.length && (
            <p className="blink">_</p>
          )}
        </div>
      )}

      {phase === 'GRANTED' && (
        <div className="h-[80vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-1000">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-widest">[ ACCESS GRANTED ]</h1>
          <p className="text-2xl md:text-3xl mb-8">접근 허용됨</p>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-4 mt-12">WELCOME, ADMINISTRATOR</h2>
          <p className="text-xl md:text-2xl">관리자님 환영합니다.</p>
        </div>
      )}

      {phase === 'DASHBOARD' && (
        <div className="max-w-3xl mx-auto mt-10 animate-in fade-in duration-1000">
          <div className="border-b border-green-500 pb-4 mb-8">
            <h2 className="text-3xl font-bold tracking-widest">ADMINISTRATOR ONLY</h2>
            <p className="text-sm opacity-70 mt-1">관리자 전용</p>
          </div>
          
          <ul className="space-y-4">
            {DASHBOARD_LINKS.map((link, idx) => (
              <li key={idx}>
                <button 
                  onClick={() => handleLinkClick(link)}
                  className="flex items-center hover:text-green-300 hover:translate-x-2 transition-all duration-200 text-left w-full group"
                >
                  <span className="mr-4">&gt;</span>
                  <span className="text-xl">{link}</span>
                </button>
              </li>
            ))}
          </ul>
          
          <div className="mt-16 w-full border-2 border-red-900 bg-red-950/10 p-12 text-center relative overflow-hidden blood-box rounded-sm">
            <div className="absolute inset-0 bg-red-900/5 pulse-bg"></div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl tracking-[0.2em] md:tracking-[0.3em] font-black leading-tight relative z-10 blood-text-effect">
              ABYSS GATE<br/>
              <span className="text-xl md:text-3xl tracking-[0.4em] mt-4 block">THE SURVIVAL</span>
            </h1>
          </div>
        </div>
      )}

      {phase === 'PAGE' && (
        <div className="max-w-4xl mx-auto mt-10 animate-in fade-in duration-500">
          <button 
            onClick={() => setPhase('DASHBOARD')}
            className="mb-8 hover:text-green-300 flex items-center group"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">&lt;</span> 
            돌아가기 (BACK)
          </button>
          
          {currentPage === '종료된 세션 로그' ? (
            <div className="font-mono text-sm md:text-base">
              {sessionLogPhase === 'CHECKING' && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-500">
                  <p className="text-xl font-bold mb-4">[ SYSTEM ]</p>
                  {SESSION_LOG_MESSAGES.slice(0, numMessages).map((msg, idx) => (
                    <LogMessage 
                      key={idx} 
                      msg={msg} 
                      isRecovery={idx === 4} 
                      stopDots={idx === 4 && numMessages > 5} 
                    />
                  ))}
                  {sessionLogStep === 5 && (
                    <button 
                      onClick={() => setSessionLogStep(6)}
                      className="border border-green-500 p-4 my-2 text-left hover:bg-green-900/30 transition-colors w-fit animate-pulse"
                    >
                      <p className="font-bold text-lg">[ CLICK TO ATTEMPT RECOVERY ]</p>
                      <p className="opacity-80">클릭하여 복구 시도</p>
                    </button>
                  )}
                  {sessionLogStep <= SESSION_LOG_MESSAGES.length && sessionLogStep !== 5 && (
                    <p className="blink">_</p>
                  )}
                </div>
              )}
              {sessionLogPhase === 'RESULT' && (
                <div className="animate-in fade-in duration-1000 max-w-4xl mx-auto">
                  <div className="mb-6 border-b border-green-500/50 pb-4">
                    <h2 className="text-2xl md:text-3xl font-bold mb-1">Closed Session Logs</h2>
                    <h3 className="text-lg md:text-xl font-bold mb-4">종료된 세션 로그</h3>
                    
                    <div className="text-xs md:text-sm opacity-80 flex flex-col gap-1 bg-red-900/20 p-2 border-l-2 border-red-500 w-fit">
                      <p className="text-red-400">Partial data loss detected. (일부 기록 손실)</p>
                      <p className="text-green-400">Displaying available data. (데이터 일부를 출력합니다.)</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {CLOSED_SESSION_LOGS.map((log, idx) => {
                      const isUnlocked = unlockedLogs.includes(log.id);
                      return (
                      <div key={idx} className="border border-green-500/30 bg-green-900/10 rounded-sm hover:bg-green-900/20 transition-colors flex">
                        <div className="flex-1 p-2 md:p-3">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5 border-b border-green-500/30 pb-1.5">
                            <span className="font-bold text-xs md:text-sm text-white">{log.id}. {isUnlocked ? log.unlockedName : log.name}</span>
                            <span className="opacity-70 hidden sm:inline text-[10px]">│</span>
                            <span className="text-green-400 text-[10px] md:text-xs">(Code: {isUnlocked ? log.unlockedCode : log.code})</span>
                            <span className="opacity-70 hidden sm:inline text-[10px]">│</span>
                            <span className={`font-bold text-[10px] md:text-xs ${
                              log.tier === 'SSR' ? 'text-yellow-400' : 
                              log.tier === 'SR' ? 'text-purple-400' : 
                              log.tier === 'R' ? 'text-blue-400' : 
                              'text-gray-400'
                            }`}>TIER: {log.tier}</span>
                          </div>
                          <div className="flex flex-col gap-1 text-[10px] md:text-xs leading-relaxed text-white">
                            <p><span className="font-bold opacity-80 text-green-300">조건:</span> {isUnlocked ? log.unlockedCondition : log.condition}</p>
                            <p><span className="font-bold opacity-80 text-green-300">분석:</span> {isUnlocked ? log.unlockedAnalysis : log.analysis}</p>
                            {(isUnlocked && log.unlockedExtra ? log.unlockedExtra : log.extra)?.map((ex, i) => (
                              <p key={i} className="text-red-400/80 mt-0.5">{ex}</p>
                            ))}
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setActiveLogId(log.id);
                            if (unlockedLogs.includes(log.id)) {
                              setShowImageModal(true);
                            } else {
                              setShowCodeInput(true);
                              setCodeInput("");
                              setCodeError(false);
                            }
                          }}
                          className={`w-16 md:w-24 border-l border-green-500/30 p-2 flex items-center justify-center transition-colors cursor-pointer group ${unlockedLogs.includes(log.id) ? 'bg-green-500/20 hover:bg-green-500/40' : 'bg-green-900/20 hover:bg-green-500/20'}`}
                        >
                          <span className={`text-[8px] md:text-[10px] text-center transition-opacity ${unlockedLogs.includes(log.id) ? 'opacity-100 text-white' : 'opacity-50 group-hover:opacity-100 group-hover:text-white'}`}>
                            {unlockedLogs.includes(log.id) ? '[ VIEW ]' : '[ LOAD IMAGE ]'}
                          </span>
                        </button>
                      </div>
                    )})}
                  </div>

                  {/* Code Input Modal */}
                  {showCodeInput && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                      <div className="border border-green-500 bg-black p-6 flex flex-col gap-4 w-80 animate-in zoom-in duration-200">
                        <p className="text-green-500 font-bold text-center">ENTER CODE FOR {activeLogId}</p>
                        <input
                          type="password"
                          value={codeInput}
                          onChange={(e) => setCodeInput(e.target.value)}
                          className="bg-transparent border-b border-green-500 text-white outline-none p-2 text-center text-xl tracking-widest"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCodeSubmit();
                            if (e.key === 'Escape') setShowCodeInput(false);
                          }}
                        />
                        {codeError && <p className="text-red-500 text-xs text-center blink">ACCESS DENIED</p>}
                        <div className="flex justify-between mt-4">
                          <button onClick={() => setShowCodeInput(false)} className="text-green-500/50 hover:text-green-500 text-sm">CANCEL</button>
                          <button onClick={handleCodeSubmit} className="text-green-500 hover:text-white font-bold text-sm">SUBMIT</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Image Modal Placeholder */}
                  {showImageModal && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                      <div className="border border-green-500 bg-black p-4 md:p-8 flex flex-col items-center gap-4 md:gap-6 max-w-3xl w-full animate-in fade-in duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <p className="text-xl md:text-2xl font-bold text-white">[{activeLogId} IMAGE DATA]</p>
                        <div className="w-full border border-green-500/30 flex items-center justify-center bg-green-900/10 min-h-[200px]">
                          {activeLogId && (
                            <img 
                              src={CLOSED_SESSION_LOGS.find(l => l.id === activeLogId)?.imageUrl} 
                              alt={`${activeLogId} data`}
                              className="max-w-full h-auto object-contain max-h-[60vh]"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                        <button 
                          onClick={() => setShowImageModal(false)}
                          className="border border-green-500 px-6 py-2 hover:bg-green-900/30 transition-colors text-white"
                        >
                          CLOSE
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : currentPage === '참가자 기록' ? (
            <div className="font-mono text-sm md:text-base">
              <p className="mb-4 text-xl font-bold">[ OBSERVER RECORD: PARTICIPANTS ]</p>
              <p className="text-green-500/50 mb-6">----------------------------------------</p>
              <p className="mb-6 text-lg">&gt; DISPLAYING RECORD:</p>
              
              <div className="mb-2 flex text-green-500/70 border-b border-green-500/30 pb-2 font-bold">
                <span className="w-28">ID</span>
                <span className="w-36">│ STATUS</span>
                <span>│ DEATH COUNT</span>
              </div>
              
              <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                {participants.map((r, idx) => {
                  let rowClass = "flex items-center hover:bg-green-900/30 cursor-pointer p-1 transition-colors";
                  let statusText = "";

                  if (r.statusType === 'DECEASED') {
                    rowClass += " text-red-500 line-through";
                    statusText = "DECEASED";
                  } else if (r.statusType === 'RESET') {
                    rowClass += " text-gray-500";
                    statusText = "RESET 20";
                  } else if (r.statusType === 'RELEASED') {
                    rowClass += " text-sky-400";
                    statusText = "RELEASED 20";
                  } else if (r.statusType === 'MISSING') {
                    rowClass += " text-yellow-500 font-bold";
                    statusText = "MISSING";
                  } else if (r.statusType === 'ACTIVE') {
                    rowClass += " text-blue-500";
                    statusText = `ACTIVE ${r.activeNum.toString().padStart(2, '0')}`;
                  }

                  return (
                    <div key={idx} className={rowClass}>
                      <span className="w-28">&gt;[{r.id}]</span>
                      <span className="w-36">{statusText}</span>
                      <span className="ml-4">{r.deathCount.toString().padStart(2, '0')}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="border border-green-500 p-4 md:p-8 bg-green-950/20">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 border-b border-green-500/50 pb-4">{currentPage}</h2>
              
              {currentPage === 'OBSERVER RIES' || currentPage === 'OBSERVER RIES 19' ? (
              <div className="flex flex-col items-center w-full">
                <div className="border border-green-500 p-4 md:p-6 w-full bg-black/50 text-left relative font-mono text-sm md:text-base mb-6">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-green-500"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-green-500"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-green-500"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-green-500"></div>
                  
                  <div className="text-green-300 leading-relaxed whitespace-pre-wrap grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="flex flex-col gap-6">
                      <div>
                        <p className="font-bold">[ OBSERVER RECORD: #E-020-A ]</p>
                        <p className="font-bold">[ ENTITY NAME: RIES ]</p>
                      </div>
                      
                      <div className="border-t border-dashed border-green-500/30 pt-4">
                        <p className="font-bold mb-2 text-green-500">[ CLASS ]</p>
                        <p>Final Gate Entity (최종 관문 개체)</p>
                      </div>

                      <div className="border-t border-dashed border-green-500/30 pt-4">
                        <p className="font-bold mb-2 text-green-500">[ BEHAVIOR ]</p>
                        <p>대상에게 먼저 접근함.</p>
                        <p>안정감과 위로를 제공하는 태도 유지.</p>
                        <p className="mt-4">이후 즉시 제거.</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-6">
                      <div>
                        <p className="font-bold mb-2 text-green-500">[ ENTRY ORIGIN ]</p>
                        <p>기록 없음.</p>
                        <p className="mt-4">해당 개체는 항상 마지막 단계에서만 등장함.</p>
                      </div>

                      <div className="border-t border-dashed border-green-500/30 pt-4">
                        <p className="font-bold mb-2 text-green-500">[ MISC ]</p>
                        <p>밝은 환경을 선호함.</p>
                        <p>항상 깨끗한 상태를 유지함.</p>
                        <p className="mt-4">항상 작게 소곤 거림.</p>
                        <p>단 음식을 선호하는 것으로 추정됨.</p>
                        <p className="mt-4">검은색 드레스를 추구함.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full flex flex-col gap-4">
                  {currentPage === 'OBSERVER RIES' ? (
                    <>
                      <div className="flex gap-4 w-full">
                        <button 
                          onClick={() => {
                            setIsBasicExpanded(!isBasicExpanded);
                            setHasBasicBeenClicked(true);
                          }}
                          className="flex-1 border border-green-500 py-2 bg-green-900/20 hover:bg-green-500/20 transition-colors text-green-400 font-bold tracking-widest"
                        >
                          기본
                        </button>
                        <button 
                          onClick={() => setIsNotFoundExpanded(!isNotFoundExpanded)}
                          disabled={!hasBasicBeenClicked}
                          className={`flex-1 border border-green-500 py-2 transition-colors font-bold tracking-widest ${hasBasicBeenClicked ? 'bg-green-900/20 hover:bg-green-500/20 text-green-400' : 'bg-gray-900/50 text-gray-600 border-gray-700 cursor-not-allowed'}`}
                        >
                          찾을 수 없음
                        </button>
                      </div>
                      
                      {isBasicExpanded && (
                        <div className="w-full border border-green-500 p-4 bg-black/50 animate-in slide-in-from-top-4 duration-300 flex flex-col gap-4 items-center min-h-[200px]">
                          {RIES_BASIC_IMAGES.map((src, idx) => (
                            <img key={idx} src={src} alt={`Basic ${idx + 1}`} className="max-w-full h-auto border border-green-500/30" referrerPolicy="no-referrer" />
                          ))}
                          <button 
                            onClick={() => setIsBasicExpanded(false)}
                            className="w-full border border-green-500 py-2 bg-green-900/20 hover:bg-green-500/20 transition-colors text-green-400 font-bold tracking-widest mt-2"
                          >
                            닫기
                          </button>
                        </div>
                      )}
                      
                      {isNotFoundExpanded && (
                        <div className="w-full border border-green-500 p-4 bg-black/50 animate-in slide-in-from-top-4 duration-300 flex flex-col gap-4 items-center min-h-[200px]">
                          {RIES_NOT_FOUND_IMAGES.map((src, idx) => (
                            <img key={idx} src={src} alt={`Not Found ${idx + 1}`} className="max-w-full h-auto border border-green-500/30" referrerPolicy="no-referrer" />
                          ))}
                          <button 
                            onClick={() => setIsNotFoundExpanded(false)}
                            className="w-full border border-green-500 py-2 bg-green-900/20 hover:bg-green-500/20 transition-colors text-green-400 font-bold tracking-widest mt-2"
                          >
                            닫기
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex gap-4 w-full">
                        <button 
                          onClick={() => setIsWarningExpanded(!isWarningExpanded)}
                          className="flex-1 border border-red-500 py-2 bg-red-900/20 hover:bg-red-500/20 transition-colors text-red-400 font-bold tracking-widest"
                        >
                          WARNING!! UNKOWN FILE
                        </button>
                      </div>
                      
                      {isWarningExpanded && (
                        <div className="w-full border border-red-500 p-4 bg-black/50 animate-in slide-in-from-top-4 duration-300 flex flex-col gap-4 items-center min-h-[200px]">
                          {RIES_19_NOT_FOUND_IMAGES.map((src, idx) => (
                            <img 
                              key={idx} 
                              src={src} 
                              alt={`Warning ${idx + 1}`} 
                              className="max-w-full h-auto border border-red-500/30 cursor-pointer hover:border-red-500 transition-colors" 
                              referrerPolicy="no-referrer" 
                              onClick={() => setExpandedImageUrl(src)}
                            />
                          ))}
                          <button 
                            onClick={() => setIsWarningExpanded(false)}
                            className="w-full border border-red-500 py-2 bg-red-900/20 hover:bg-red-500/20 transition-colors text-red-400 font-bold tracking-widest mt-2"
                          >
                            닫기
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="min-h-[400px] flex items-center justify-center border border-dashed border-green-500/30">
                <p className="text-green-500/50 animate-pulse">데이터를 불러오는 중... (NO DATA FOUND)</p>
              </div>
            )}
            </div>
          )}
        </div>
      )}

      {/* RIES Image Expansion Modal */}
      {expandedImageUrl && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[70] cursor-pointer"
          onClick={() => setExpandedImageUrl(null)}
        >
          <img 
            src={expandedImageUrl} 
            alt="Expanded RIES data"
            className="max-w-full max-h-screen object-contain animate-in fade-in zoom-in duration-300"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Lock Message Modal */}
      {showLockMessage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
          <div className="border border-red-500 bg-black p-6 flex flex-col gap-4 w-80 animate-in zoom-in duration-200 text-center">
            <p className="text-red-500 font-bold text-xl blink">잠겨있습니다.</p>
            <p className="text-red-400 text-sm">세션 로그 #04를 해제하십시오.</p>
          </div>
        </div>
      )}
    </div>
  );
}
