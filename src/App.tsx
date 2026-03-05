import React, { useState, useEffect } from 'react';
import { TitleBar } from './components/TitleBar';
import { FolderOpen, Settings, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface Pack {
    name: string;
    path: string;
}

function App() {
    const [fivemPath, setFivemPath] = useState<string>('');
    const [packs, setPacks] = useState<Pack[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [applying, setApplying] = useState<string | null>(null);
    const [currentTheme, setCurrentTheme] = useState<string>('ocean');

    // Load saved path and theme on mount
    useEffect(() => {
        const savedPath = localStorage.getItem('fcc_fivem_path');
        if (savedPath) {
            setFivemPath(savedPath);
            loadPacks(savedPath);
        }

        const savedTheme = localStorage.getItem('fcc_theme');
        if (savedTheme) {
            setCurrentTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            document.documentElement.setAttribute('data-theme', 'ocean');
        }
    }, []);

    const changeTheme = (theme: string) => {
        setCurrentTheme(theme);
        localStorage.setItem('fcc_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        showMessage('テーマを変更しました。', 'success');
    };

    const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const handleSelectFolder = async () => {
        if (window.electronAPI) {
            const path = await window.electronAPI.selectFolder();
            if (path) {
                // Validate if it looks like FiveM Application Data
                const isDataFolder = path.endsWith('FiveM Application Data');
                if (!isDataFolder && !(await window.electronAPI.checkExists(`${path}\\citizen`))) {
                    showMessage('警告: 有効な FiveM Application Data フォルダではない可能性があります。', 'error');
                } else {
                    setFivemPath(path);
                    localStorage.setItem('fcc_fivem_path', path);
                    showMessage('フォルダパスを保存しました。', 'success');
                    loadPacks(path);
                }
            }
        }
    };

    const loadPacks = async (path: string) => {
        setLoading(true);
        try {
            if (window.electronAPI) {
                const loadedPacks = await window.electronAPI.getPacks(path);
                setPacks(loadedPacks);
            }
        } catch (e) {
            showMessage('パックリストの読み込みに失敗しました。', 'error');
        } finally {
            setLoading(false);
        }
    };

    const reloadPacks = () => {
        if (fivemPath) loadPacks(fivemPath);
    }

    const handleApplyPack = async (packName: string) => {
        if (!fivemPath) {
            showMessage('FiveM フォルダのパスが設定されていません。', 'error');
            return;
        }

        setApplying(packName);
        try {
            const result = await window.electronAPI.applyPack(fivemPath, packName);
            if (result.success) {
                showMessage(result.message, 'success');
            } else {
                showMessage(result.message, 'error');
            }
        } catch (error: any) {
            showMessage(`適用エラー: ${error.message || '不明なエラー'}`, 'error');
        } finally {
            setApplying(null);
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-app-base overflow-hidden text-app-text transition-colors duration-300">
            <TitleBar />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 relative">

                {/* Header Section */}
                <header className="flex justify-between items-end border-b border-app-border pb-4">
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-app-gradient-start to-app-gradient-end bg-clip-text text-transparent">
                            FCC Manager
                        </h1>
                        <p className="text-sm text-app-muted mt-1">FiveM Citizen 統合管理ツール</p>
                    </div>
                </header>

                {/* Global Messages */}
                {message.text && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' :
                        message.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' :
                            'bg-blue-500/10 border-blue-500/50 text-blue-400'
                        }`}>
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                {/* Setup & Theme Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Setup Section */}
                    <section className="bg-app-panel p-5 rounded-xl border border-app-border backdrop-blur-sm">
                        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-app-text">
                            <Settings className="text-app-primary" size={20} />
                            基本設定
                        </h2>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                readOnly
                                value={fivemPath || 'FiveM Application Data フォルダを選択...'}
                                className="flex-1 bg-app-base border border-app-border rounded-lg px-4 py-2 text-sm text-app-text outline-none focus:border-app-primary transition-colors"
                                placeholder="C:\\Users\\...\\FiveM Application Data"
                            />
                            <button
                                onClick={handleSelectFolder}
                                className="bg-app-primary hover:bg-app-primary-hover text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                            >
                                <FolderOpen size={16} /> 参照...
                            </button>
                        </div>
                        {!fivemPath && (
                            <p className="text-xs text-app-primary mt-3 pt-3 border-t border-app-border opacity-80">
                                ※ 初めにデスクトップのFiveMショートカットから「ファイルの場所を開く」で辿れる `FiveM Application Data` フォルダを指定してください。
                            </p>
                        )}
                    </section>

                    {/* Theme Switcher Section */}
                    <section className="bg-app-panel p-5 rounded-xl border border-app-border backdrop-blur-sm">
                        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-app-text">
                            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-app-gradient-start to-app-gradient-end"></span>
                            テーマ変更
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'ocean', name: 'Ocean' },
                                { id: 'crimson', name: 'Crimson' },
                                { id: 'hacker', name: 'Hacker' },
                                { id: 'midnight', name: 'Midnight' },
                                { id: 'sunlight', name: 'Sunlight' }
                            ].map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => changeTheme(theme.id)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${currentTheme === theme.id
                                            ? 'bg-app-primary text-white shadow-lg'
                                            : 'bg-app-base text-app-muted hover:text-app-text border border-app-border'
                                        }`}
                                >
                                    {theme.name}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Citizen Packs Section */}
                <section className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-app-text">利用可能なパック</h2>
                        <button
                            onClick={reloadPacks}
                            disabled={!fivemPath || loading}
                            className="p-2 hover:bg-app-panel-hover rounded-lg text-app-muted hover:text-app-primary transition-colors disabled:opacity-50"
                            title="パック一覧をリロード"
                        >
                            <RefreshCw size={16} className={loading && !applying ? "animate-spin" : ""} />
                        </button>
                    </div>

                    {fivemPath ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Vanilla Option (Always present) */}
                            <div className="bg-app-panel border border-app-border rounded-xl p-5 hover:border-app-muted transition-all flex flex-col relative overflow-hidden group">
                                <h3 className="text-xl font-bold text-app-text mb-1 relative z-10">Vanilla （標準状態）</h3>
                                <p className="text-sm text-app-muted mb-6 flex-1 relative z-10">変更をすべてリセットし、デフォルトに戻します。</p>
                                <button
                                    onClick={() => handleApplyPack('Vanilla')}
                                    disabled={applying !== null}
                                    className="w-full py-2.5 rounded-lg font-medium bg-app-base hover:bg-app-panel-hover text-app-text border border-app-border disabled:opacity-50 transition-colors relative z-10"
                                >
                                    {applying === 'Vanilla' ? '適用中...' : '標準に戻す'}
                                </button>
                            </div>

                            {/* Custom Packs */}
                            {packs.length === 0 ? (
                                <div className="col-span-1 md:col-span-2 text-center p-12 border border-dashed border-app-border rounded-xl">
                                    <p className="text-app-muted">カスタムパックが見つかりません。</p>
                                    <p className="text-sm text-app-muted opacity-80 mt-2">
                                        指定したフォルダ内の <code>FCC_Citizens</code> フォルダにパックを入れて更新してください。
                                    </p>
                                </div>
                            ) : (
                                packs.map(pack => (
                                    <div key={pack.name} className="bg-app-panel border border-app-border rounded-xl p-5 hover:border-app-primary transition-all flex flex-col relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110 opacity-10 bg-app-primary"></div>
                                        <h3 className="text-xl font-bold text-app-text mb-1 relative z-10">{pack.name}</h3>
                                        <p className="text-sm text-app-muted mb-6 flex-1 relative z-10 break-all">パス: ...\{pack.name}</p>
                                        <button
                                            onClick={() => handleApplyPack(pack.name)}
                                            disabled={applying !== null}
                                            className="w-full py-2.5 rounded-lg flex justify-center items-center gap-2 font-medium bg-gradient-to-r from-app-gradient-start to-app-gradient-end hover:from-app-primary hover:to-app-primary-glow text-white shadow-lg disabled:opacity-50 transition-all relative z-10"
                                        >
                                            {applying === pack.name ? (
                                                <><RefreshCw size={16} className="animate-spin" /> 適用中...</>
                                            ) : '適用する'}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-app-muted opacity-50">
                            <FolderOpen size={48} className="mb-4" />
                            <p>FiveMフォルダを設定すると、パック一覧が表示されます。</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default App;
