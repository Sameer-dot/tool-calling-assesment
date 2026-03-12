import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export function AppLayout({ children, sidebar }: AppLayoutProps) {
  return (
    <div className={styles.layout}>
      <main className={styles.main}>{children}</main>
      <aside className={styles.sidebar}>{sidebar}</aside>
    </div>
  );
}
