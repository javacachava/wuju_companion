type Props = {
  personalityRaw: string;
  instructionsRaw: string;
};

export function PersonalityPanel({ personalityRaw, instructionsRaw }: Props) {
  return (
    <section className="card">
      <h3>Personalidad e Instrucciones</h3>
      <details open>
        <summary>personality.mb</summary>
        <pre style={{ whiteSpace: "pre-wrap" }}>{personalityRaw}</pre>
      </details>
      <details>
        <summary>instructions.mb</summary>
        <pre style={{ whiteSpace: "pre-wrap" }}>{instructionsRaw}</pre>
      </details>
    </section>
  );
}
