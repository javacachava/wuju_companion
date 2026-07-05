"use client";

type Voice = {
  provider: string;
  voiceId: string;
  speed: number;
  pitch: number;
  language?: string;
};

type Props = {
  voice: Voice;
  onSpeedChange: (speed: number) => void;
  onPitchChange: (pitch: number) => void;
};

export function VoiceSelector({ voice, onSpeedChange, onPitchChange }: Props) {
  return (
    <section className="card">
      <h3>Voz</h3>
      <p className="muted">
        {voice.provider} - {voice.voiceId}
      </p>
      <label style={{ display: "grid", gap: 6 }}>
        Velocidad: {voice.speed.toFixed(1)}
        <input
          type="range"
          min={0.5}
          max={2}
          step={0.1}
          value={voice.speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
        />
      </label>
      <label style={{ display: "grid", gap: 6 }}>
        Pitch: {voice.pitch.toFixed(1)}
        <input
          type="range"
          min={-12}
          max={12}
          step={1}
          value={voice.pitch}
          onChange={(e) => onPitchChange(Number(e.target.value))}
        />
      </label>
    </section>
  );
}
