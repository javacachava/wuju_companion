type Permissions = {
  screen: boolean;
  clipboard: boolean;
  filesystem: boolean;
  microphone: boolean;
  ocr?: boolean;
  notifications?: boolean;
};

type Props = {
  permissions: Permissions;
};

export function PermissionPanel({ permissions }: Props) {
  return (
    <section className="card">
      <h3>Permisos</h3>
      <ul>
        {Object.entries(permissions).map(([key, value]) => (
          <li key={key}>
            {value ? "☑" : "☐"} {key}
          </li>
        ))}
      </ul>
    </section>
  );
}
