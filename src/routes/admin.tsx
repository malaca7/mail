import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/logo";
import { useTheme } from "@/hooks/use-theme";

import { 
  Shield, ShieldCheck, ShieldAlert, Users, UserPlus, UserCog, UserX, Settings, Lock, 
  Mail, Server, HardDrive, Activity, AlertTriangle, CheckCircle2, XCircle, Search, 
  RefreshCw, Trash2, Edit, Eye, EyeOff, Sun, Moon, ArrowLeft, Bug, Zap, Globe, Key, 
  FileText, BarChart3, TrendingUp, Database, Clock, Power, Ban 
} from "lucide-react";

// Admin auth
import { adminLogin, adminLogout, isAdminAuthenticated, changeAdminPassword } from "@/lib/mail/admin-auth";

// Account management
import { getAllAccounts, registerAccount, updateAccount, deleteAccount, getAccountStats, type StoredAccount, DEMO_ACCOUNT } from "@/lib/mail/session";

// Security config
import { getSecurityConfig, saveSecurityConfig, generateDMARCRecord, type SecurityConfig } from "@/lib/mail/security-config";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Admin — Malaca Mail" },
      { name: "description", content: "Painel de administração do Malaca Mail para gerenciamento de contas e segurança." },
    ],
  }),
  component: AdminPanel,
});

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => isAdminAuthenticated());
  const [password, setPassword] = useState("");
  const { theme, setTheme } = useTheme();
  
  // Data States
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [stats, setStats] = useState(() => getAccountStats());
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig | null>(null);
  
  // UI States
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // New Account Form State
  const [newAccUsername, setNewAccUsername] = useState("");
  const [newAccName, setNewAccName] = useState("");
  const [newAccPassword, setNewAccPassword] = useState("");

  // Anti-spam states (mocked for UI as per requirements)
  const [spamEnabled, setSpamEnabled] = useState(true);
  const [spamThreshold, setSpamThreshold] = useState(5);
  const [spamAutoLearn, setSpamAutoLearn] = useState(true);
  const [spamRules, setSpamRules] = useState([
    { id: 1, name: "URIBL_BLACK", desc: "Contém URL listada na URIBL", enabled: true },
    { id: 2, name: "RCVD_IN_PBL", desc: "Recebido de IP em Spamhaus PBL", enabled: true },
    { id: 3, name: "BAYES_99", desc: "Probabilidade Bayesiana de spam > 99%", enabled: true },
    { id: 4, name: "HTML_IMAGE_ONLY", desc: "HTML contém apenas imagem, sem texto", enabled: true },
  ]);
  
  // Anti-virus states (mocked for UI)
  const [avEnabled, setAvEnabled] = useState(true);
  const [avScanAttachments, setAvScanAttachments] = useState(true);
  const [avScanLinks, setAvScanLinks] = useState(false);
  const [avMaxSize, setAvMaxSize] = useState(25);

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const refreshData = () => {
    setAccounts(getAllAccounts());
    setStats(getAccountStats());
    setSecurityConfig(getSecurityConfig());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(password)) {
      setIsAuthenticated(true);
      toast.success("Login efetuado com sucesso");
    } else {
      toast.error("Senha incorreta");
    }
  };

  const handleLogout = () => {
    adminLogout();
    setIsAuthenticated(false);
    toast.success("Sessão encerrada");
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newAccUsername || !newAccName || !newAccPassword) {
        toast.error("Preencha todos os campos");
        return;
      }
      
      registerAccount({
        username: newAccUsername,
        nome: newAccName,
        senha: newAccPassword,
      });

      toast.success("Conta criada com sucesso");
      setIsCreatingAccount(false);
      setNewAccUsername("");
      setNewAccName("");
      setNewAccPassword("");
      refreshData();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleToggleSuspend = (account: StoredAccount) => {
    if (account.id === "u1") {
      toast.error("Não é possível suspender a conta de demonstração");
      return;
    }
    const newStatus = !account.suspended;
    updateAccount(account.id, { suspended: newStatus });
    toast.success(newStatus ? "Conta suspensa" : "Conta reativada");
    refreshData();
  };

  const handleDeleteAccount = (account: StoredAccount) => {
    if (account.id === "u1") {
      toast.error("Não é possível excluir a conta de demonstração");
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir a conta ${account.email}?`)) {
      deleteAccount(account.id);
      toast.success("Conta excluída");
      refreshData();
    }
  };

  const handleSaveSecurity = () => {
    if (securityConfig) {
      saveSecurityConfig(securityConfig);
      toast.success("Configurações de segurança salvas");
      refreshData();
    }
  };

  const handleSaveSpam = () => {
    toast.success("Configurações de Antispam & Antivírus salvas com sucesso");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md glass-card rounded-xl p-8 shadow-tech glow-border relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>
          
          <div className="flex flex-col items-center mb-8">
            <Logo variant="horizontal" size="lg" />
            <h1 className="text-2xl font-display font-bold text-foreground mt-3">Malaca Admin</h1>
            <p className="text-muted-foreground mt-1">Autenticação restrita ao sistema</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Senha de Administrador</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-surface/50 font-mono"
                  placeholder="••••••••"
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Dica: a senha padrão é <code className="font-mono bg-muted px-1 py-0.5 rounded">admin2026</code>
              </p>
            </div>

            <Button type="submit" className="w-full">
              Entrar no Painel Admin
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-primary hover:underline flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para o Webmail
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredAccounts = accounts.filter(acc => 
    (acc.nome || acc.email).toLowerCase().includes(searchQuery.toLowerCase()) || 
    acc.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-surface/80 backdrop-blur-md px-6 shadow-sm">
        <div className="flex items-center gap-3 mr-auto">
          <Logo variant="horizontal" size="md" />
          <Badge variant="outline" className="tech-badge bg-primary/10 text-primary border-primary/20">
            ADMIN
          </Badge>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Link to="/">
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
              <Mail className="h-4 w-4" />
              Webmail
            </Button>
          </Link>
          
          <Button variant="destructive" size="sm" onClick={handleLogout} className="gap-2">
            <Power className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-surface border border-border p-1">
              <TabsTrigger value="dashboard" className="gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="contas" className="gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Contas</span>
              </TabsTrigger>
              <TabsTrigger value="seguranca" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Segurança</span>
              </TabsTrigger>
              <TabsTrigger value="antispam" className="gap-2">
                <Bug className="h-4 w-4" />
                <span className="hidden sm:inline">Antispam & Antivírus</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB: DASHBOARD */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-6 rounded-xl shadow-tech relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Users className="h-24 w-24" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" /> Total de Contas
                    </p>
                    <h3 className="text-3xl font-display font-bold mt-2">{stats.totalAccounts}</h3>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                </div>

                <div className="glass-card p-6 rounded-xl shadow-tech relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Mail className="h-24 w-24" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" /> Total de E-mails
                    </p>
                    <h3 className="text-3xl font-display font-bold mt-2">{stats.totalEmails}</h3>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                </div>

                <div className="glass-card p-6 rounded-xl shadow-tech relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <HardDrive className="h-24 w-24" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-primary" /> Armazenamento
                    </p>
                    <h3 className="text-3xl font-display font-bold mt-2">{formatBytes(stats.totalStorageBytes)}</h3>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 to-yellow-500"></div>
                </div>

                <div className="glass-card p-6 rounded-xl shadow-tech relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Server className="h-24 w-24" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-500" /> Status do Servidor
                    </p>
                    <h3 className="text-3xl font-display font-bold mt-2 text-emerald-500">Online</h3>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-xl border border-border">
                  <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                    <Server className="h-5 w-5 text-primary" />
                    Serviços
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: "SMTP", port: 587, status: "Online", uptime: "99.9%" },
                      { name: "IMAP", port: 993, status: "Online", uptime: "100%" },
                      { name: "POP3", port: 995, status: "Online", uptime: "99.9%" },
                      { name: "Webmail", port: 443, status: "Online", uptime: "100%" },
                    ].map(service => (
                      <div key={service.name} className="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="font-medium">{service.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">:{service.port}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">Uptime: {service.uptime}</span>
                          <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
                            {service.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-xl border border-border">
                  <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Resumo de Segurança
                  </h3>
                  {securityConfig && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-border/50">
                        <div className="flex items-center gap-3">
                          {securityConfig.dkim.enabled ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-destructive" />}
                          <div>
                            <p className="font-medium">Assinatura DKIM</p>
                            <p className="text-xs text-muted-foreground">Autenticidade das mensagens enviadas</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={securityConfig.dkim.enabled ? "border-emerald-500/30 text-emerald-500" : "border-destructive/30 text-destructive"}>
                          {securityConfig.dkim.enabled ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-border/50">
                        <div className="flex items-center gap-3">
                          {securityConfig.spf.enabled ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-destructive" />}
                          <div>
                            <p className="font-medium">Registro SPF</p>
                            <p className="text-xs text-muted-foreground">Autorização de IPs de envio</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={securityConfig.spf.enabled ? "border-emerald-500/30 text-emerald-500" : "border-destructive/30 text-destructive"}>
                          {securityConfig.spf.enabled ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-border/50">
                        <div className="flex items-center gap-3">
                          {securityConfig.dmarc.enabled ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-destructive" />}
                          <div>
                            <p className="font-medium">Política DMARC</p>
                            <p className="text-xs text-muted-foreground">Proteção contra falsificação (spoofing)</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className={securityConfig.dmarc.enabled ? "border-emerald-500/30 text-emerald-500" : "border-destructive/30 text-destructive"}>
                            {securityConfig.dmarc.enabled ? "Ativo" : "Inativo"}
                          </Badge>
                          {securityConfig.dmarc.enabled && (
                            <span className="text-xs font-mono text-muted-foreground">p={securityConfig.dmarc.policy}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB: CONTAS */}
            <TabsContent value="contas" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-xl border border-border">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar contas..." 
                    className="pl-9 bg-background/50 border-border/50"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button onClick={() => setIsCreatingAccount(!isCreatingAccount)} className="w-full sm:w-auto gap-2">
                  {isCreatingAccount ? <XCircle className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isCreatingAccount ? "Cancelar" : "Nova Conta"}
                </Button>
              </div>

              {isCreatingAccount && (
                <div className="glass-card p-6 rounded-xl border border-primary/30 shadow-tech animate-in fade-in slide-in-from-top-4">
                  <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Criar Nova Conta
                  </h3>
                  <form onSubmit={handleCreateAccount} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new_username">Nome de Usuário</Label>
                        <div className="flex items-center">
                          <Input 
                            id="new_username" 
                            value={newAccUsername}
                            onChange={e => setNewAccUsername(e.target.value)}
                            placeholder="usuario"
                            className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            required
                          />
                          <div className="bg-muted px-3 py-2 border border-input rounded-r-md text-sm text-muted-foreground border-l-0">
                            @malaca.com.br
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new_name">Nome Completo</Label>
                        <Input 
                          id="new_name" 
                          value={newAccName}
                          onChange={e => setNewAccName(e.target.value)}
                          placeholder="Ex: João Silva"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new_pass">Senha</Label>
                        <Input 
                          id="new_pass" 
                          type="password"
                          value={newAccPassword}
                          onChange={e => setNewAccPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button type="submit" className="gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Criar Conta
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              <div className="glass-panel rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-surface/50 border-b border-border">
                      <tr>
                        <th className="px-6 py-4 font-medium">Usuário</th>
                        <th className="px-6 py-4 font-medium">E-mail</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Armazenamento</th>
                        <th className="px-6 py-4 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAccounts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                            Nenhuma conta encontrada.
                          </td>
                        </tr>
                      ) : (
                        filteredAccounts.map((account) => (
                          <tr key={account.id} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                            <td className="px-6 py-4 font-medium flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {(account.nome || account.email).charAt(0).toUpperCase()}
                              </div>
                              {account.nome || account.email}
                            </td>
                            <td className="px-6 py-4 font-mono text-muted-foreground">
                              {account.email}
                            </td>
                            <td className="px-6 py-4">
                              {account.suspended ? (
                                <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/10 gap-1">
                                  <Ban className="w-3 h-3" /> Suspenso
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10 gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Ativo
                                </Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 font-mono text-muted-foreground">
                              {formatBytes(account.quotaUsadaBytes ?? 0)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  title={account.suspended ? "Reativar Conta" : "Suspender Conta"}
                                  onClick={() => handleToggleSuspend(account)}
                                  disabled={account.id === "u1"}
                                  className={account.suspended ? "text-emerald-500 hover:text-emerald-400" : "text-amber-500 hover:text-amber-400"}
                                >
                                  {account.suspended ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  title="Excluir Conta"
                                  onClick={() => handleDeleteAccount(account)}
                                  disabled={account.id === "u1"}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* TAB: SEGURANÇA */}
            <TabsContent value="seguranca" className="space-y-6">
              {securityConfig && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl font-bold">Configurações de Autenticação de E-mail</h2>
                    <Button onClick={handleSaveSecurity} className="gap-2">
                      <Settings className="w-4 h-4" /> Salvar Configurações
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* DKIM */}
                    <div className="glass-panel p-6 rounded-xl border border-border">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                            <Key className="w-5 h-5 text-primary" />
                            DKIM (DomainKeys Identified Mail)
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Adiciona uma assinatura criptográfica aos e-mails enviados.
                          </p>
                        </div>
                        <Switch 
                          checked={securityConfig.dkim.enabled}
                          onCheckedChange={(c) => setSecurityConfig({...securityConfig, dkim: {...securityConfig.dkim, enabled: c}})}
                        />
                      </div>
                      
                      <div className={`space-y-4 ${!securityConfig.dkim.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Seletor (Selector)</Label>
                            <Input 
                              value={securityConfig.dkim.selector} 
                              onChange={(e) => setSecurityConfig({...securityConfig, dkim: {...securityConfig.dkim, selector: e.target.value}})}
                              className="font-mono"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Algoritmo</Label>
                            <Input 
                              value={securityConfig.dkim.algorithm} 
                              onChange={(e) => setSecurityConfig({...securityConfig, dkim: {...securityConfig.dkim, algorithm: e.target.value}})}
                              className="font-mono"
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Tamanho da Chave</Label>
                            <Input 
                              value={`${securityConfig.dkim.keyBits} bits`} 
                              className="font-mono"
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Chave Pública (Registro TXT)</Label>
                          <div className="bg-background/80 p-3 rounded-md border border-border/50 font-mono text-xs text-muted-foreground break-all">
                            v=DKIM1; k=rsa; p={securityConfig.dkim.publicKey}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SPF */}
                    <div className="glass-panel p-6 rounded-xl border border-border">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                            <Globe className="w-5 h-5 text-primary" />
                            SPF (Sender Policy Framework)
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Especifica quais servidores de e-mail têm permissão para enviar e-mails em nome do seu domínio.
                          </p>
                        </div>
                        <Switch 
                          checked={securityConfig.spf.enabled}
                          onCheckedChange={(c) => setSecurityConfig({...securityConfig, spf: {...securityConfig.spf, enabled: c}})}
                        />
                      </div>
                      
                      <div className={`space-y-4 ${!securityConfig.spf.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="space-y-2">
                          <Label>Registro SPF</Label>
                          <Input 
                            value={securityConfig.spf.record} 
                            onChange={(e) => setSecurityConfig({...securityConfig, spf: {...securityConfig.spf, record: e.target.value}})}
                            className="font-mono"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={securityConfig.spf.mode === 'strict' ? 'bg-primary/20 text-primary border-primary' : 'bg-muted text-muted-foreground cursor-pointer'} onClick={() => setSecurityConfig({...securityConfig, spf: {...securityConfig.spf, mode: 'strict'}})}>Strict (-all)</Badge>
                          <Badge variant="outline" className={securityConfig.spf.mode === 'relaxed' ? 'bg-primary/20 text-primary border-primary' : 'bg-muted text-muted-foreground cursor-pointer'} onClick={() => setSecurityConfig({...securityConfig, spf: {...securityConfig.spf, mode: 'relaxed'}})}>Relaxed (~all)</Badge>
                        </div>
                      </div>
                    </div>

                    {/* DMARC */}
                    <div className="glass-panel p-6 rounded-xl border border-border">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-primary" />
                            DMARC (Domain-based Message Authentication)
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Usa SPF e DKIM para fornecer instruções sobre como lidar com e-mails não autenticados.
                          </p>
                        </div>
                        <Switch 
                          checked={securityConfig.dmarc.enabled}
                          onCheckedChange={(c) => setSecurityConfig({...securityConfig, dmarc: {...securityConfig.dmarc, enabled: c}})}
                        />
                      </div>
                      
                      <div className={`space-y-4 ${!securityConfig.dmarc.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Política (p)</Label>
                            <div className="flex gap-2">
                              {['none', 'quarantine', 'reject'].map(policy => (
                                <Badge 
                                  key={policy}
                                  variant="outline" 
                                  className={`cursor-pointer ${securityConfig.dmarc.policy === policy ? 'bg-primary/20 text-primary border-primary' : 'bg-muted text-muted-foreground'}`}
                                  onClick={() => setSecurityConfig({...securityConfig, dmarc: {...securityConfig.dmarc, policy: policy as any}})}
                                >
                                  {policy}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Porcentagem Aplicada (pct)</Label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="range" 
                                min="0" max="100" 
                                value={securityConfig.dmarc.percentage} 
                                onChange={(e) => setSecurityConfig({...securityConfig, dmarc: {...securityConfig.dmarc, percentage: parseInt(e.target.value)}})}
                                className="w-full accent-primary"
                              />
                              <span className="font-mono text-sm w-12">{securityConfig.dmarc.percentage}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>E-mail para Relatórios Agregados (rua)</Label>
                            <Input 
                              type="email"
                              value={securityConfig.dmarc.ruaEmail} 
                              onChange={(e) => setSecurityConfig({...securityConfig, dmarc: {...securityConfig.dmarc, ruaEmail: e.target.value}})}
                              className="font-mono"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>E-mail para Relatórios Forenses (ruf)</Label>
                            <Input 
                              type="email"
                              value={securityConfig.dmarc.rufEmail} 
                              onChange={(e) => setSecurityConfig({...securityConfig, dmarc: {...securityConfig.dmarc, rufEmail: e.target.value}})}
                              className="font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 pt-2">
                          <Label>Registro TXT Gerado (_dmarc)</Label>
                          <div className="bg-background/80 p-3 rounded-md border border-border/50 font-mono text-xs text-primary break-all">
                            {generateDMARCRecord(securityConfig.dmarc)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* TAB: ANTISPAM */}
            <TabsContent value="antispam" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold">Proteção contra Ameaças</h2>
                <Button onClick={handleSaveSpam} className="gap-2">
                  <Settings className="w-4 h-4" /> Salvar Configurações
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Anti-spam */}
                <div className="glass-panel p-6 rounded-xl border border-border flex flex-col">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                    <div>
                      <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                        <Bug className="w-5 h-5 text-amber-500" />
                        Filtro Antispam (SpamAssassin)
                      </h3>
                    </div>
                    <Switch checked={spamEnabled} onCheckedChange={setSpamEnabled} />
                  </div>
                  
                  <div className={`space-y-6 flex-1 ${!spamEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>Nível de Rigor (Threshold)</Label>
                        <span className="font-mono text-sm text-primary">{spamThreshold}.0</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">Mais brando</span>
                        <input 
                          type="range" min="1" max="10" step="0.5"
                          value={spamThreshold}
                          onChange={(e) => setSpamThreshold(parseFloat(e.target.value))}
                          className="w-full accent-primary"
                        />
                        <span className="text-xs text-muted-foreground">Mais rigoroso</span>
                      </div>
                      <p className="text-xs text-muted-foreground">E-mails com pontuação acima de {spamThreshold} serão marcados como SPAM.</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-aprendizado (Bayes)</Label>
                        <p className="text-xs text-muted-foreground mt-1">Aprende automaticamente com mensagens movidas para a pasta Spam.</p>
                      </div>
                      <Switch checked={spamAutoLearn} onCheckedChange={setSpamAutoLearn} />
                    </div>

                    <div className="pt-4 border-t border-border/50">
                      <Label className="mb-3 block">Regras Ativas</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {spamRules.map(rule => (
                          <div key={rule.id} className="flex items-center justify-between bg-background/50 p-2 rounded border border-border/50">
                            <div>
                              <p className="font-mono text-xs font-semibold text-foreground">{rule.name}</p>
                              <p className="text-xs text-muted-foreground">{rule.desc}</p>
                            </div>
                            <Switch 
                              checked={rule.enabled} 
                              onCheckedChange={(c) => {
                                setSpamRules(spamRules.map(r => r.id === rule.id ? {...r, enabled: c} : r));
                              }} 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Anti-virus */}
                <div className="glass-panel p-6 rounded-xl border border-border flex flex-col">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                    <div>
                      <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                        Antivírus (ClamAV)
                      </h3>
                    </div>
                    <Switch checked={avEnabled} onCheckedChange={setAvEnabled} />
                  </div>
                  
                  <div className={`space-y-6 flex-1 ${!avEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="bg-background/50 p-4 rounded-lg border border-border/50 mb-4 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Bases de Definição</p>
                        <p className="text-xs font-mono text-muted-foreground mt-1">Versão: 27042 (main.cvd)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Última atualização</p>
                        <p className="text-sm font-medium">Hoje, 04:30 AM</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Verificar Anexos</Label>
                          <p className="text-xs text-muted-foreground mt-1">Escaneia todos os arquivos anexados recebidos.</p>
                        </div>
                        <Switch checked={avScanAttachments} onCheckedChange={setAvScanAttachments} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Verificar Links (Phishing)</Label>
                          <p className="text-xs text-muted-foreground mt-1">Analisa URLs em busca de sites maliciosos.</p>
                        </div>
                        <Switch checked={avScanLinks} onCheckedChange={setAvScanLinks} />
                      </div>

                      <div className="space-y-2 pt-2">
                        <Label>Tamanho Máximo para Escaneamento (MB)</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            value={avMaxSize} 
                            onChange={(e) => setAvMaxSize(parseInt(e.target.value) || 0)}
                            className="w-24 font-mono"
                          />
                          <span className="text-sm text-muted-foreground">MB</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Arquivos maiores que isso serão ignorados (reduz uso de CPU).</p>
                      </div>
                    </div>

                    <div className="mt-auto pt-6">
                      <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-destructive mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-destructive">Quarentena</p>
                          <p className="text-xs text-muted-foreground mt-1">Existem 12 ameaças isoladas nos últimos 7 dias. Elas serão removidas automaticamente após 30 dias.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
