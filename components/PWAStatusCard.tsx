'use client'

import { usePWA } from '@/hooks/usePWA';
import { logger } from '@/utils/logger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Share2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const PWAStatusCard = () => {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline, 
    updateAvailable, 
    installApp, 
    updateApp, 
    shareApp 
  } = usePWA();

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      // Optional: Show success message
      logger.debug('App instalado com sucesso!');
    }
  };

  const handleShare = async () => {
    const success = await shareApp({
      title: 'BarConnect - Sistema para Hotéis',
      text: 'Sistema completo de gestão para bares e restaurantes!',
    });
    if (success) {
      logger.debug('App compartilhado!');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            <CardTitle className="text-lg">App Mobile</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge variant="default" className="bg-green-500">
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="destructive">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Configure o BarConnect como app no seu dispositivo para melhor experiência no hotel
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status do App */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isInstalled ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700">
                  App instalado e funcionando
                </span>
              </>
            ) : isInstallable ? (
              <>
                <Download className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">
                  Pronto para instalar
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-700">
                  Use pelo navegador por enquanto
                </span>
              </>
            )}
          </div>
          
          {updateAvailable && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
              <RefreshCw className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-700">
                Atualização disponível
              </span>
            </div>
          )}
        </div>

        {/* Funcionalidades Offline */}
        <section className="bg-gray-50 p-3 rounded-lg" aria-labelledby="hotel-optimized-heading">
          <h3 id="hotel-optimized-heading" className="text-sm font-medium mb-2">🏨 Otimizado para Hotel:</h3>
          <ul className="text-xs space-y-1 text-gray-600">
            <li>• Funciona mesmo sem internet</li>
            <li>• Dados salvos localmente</li>
            <li>• Sincronização automática</li>
            <li>• Interface touch-friendly</li>
          </ul>
        </section>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          {isInstallable && !isInstalled && (
            <Button 
              onClick={handleInstall}
              className="flex-1"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Instalar App
            </Button>
          )}
          
          {updateAvailable && (
            <Button 
              onClick={updateApp}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          )}
          
          <Button 
            onClick={handleShare}
            variant="outline"
            size="sm"
            className={isInstallable && !isInstalled ? "" : "flex-1"}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>

        {/* Instruções para iOS */}
        {!isInstalled && navigator.userAgent.includes('iPhone') && (
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            <strong>iOS:</strong> Toque em <span className="font-mono">⬆️</span> no Safari e selecione "Adicionar à Tela de Início"
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PWAStatusCard;