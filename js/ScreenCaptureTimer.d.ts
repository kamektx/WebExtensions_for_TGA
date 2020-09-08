declare class ScreenCaptureTimer {
    static readonly TickTime: number;
    static readonly TimeToRecaptureActiveWindow: number;
    static readonly TimeToRecaptureFirstTime: number;
    static readonly TimeToRecaptureInactiveWindow: number;
    IsTimerRunning: boolean;
    Run: () => Promise<void>;
    constructor();
}
//# sourceMappingURL=ScreenCaptureTimer.d.ts.map