'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Room } from '@/hooks/useRoomsDB';
import { 
  Tv, 
  Wifi, 
  Wind, 
  Wine, 
  Home, 
  Bath, 
  Wind as Dryer,
  Lock,
  Phone,
  User as Bathrobe,
  Eye,
  Accessibility,
  Cigarette,
  PawPrint,
  Building,
  Bed,
  Users,
  DollarSign,
  Maximize2,
  Plus,
  Trash2
} from 'lucide-react';

interface RoomEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  onSave: (roomData: Partial<Room>) => Promise<void>;
  mode: 'create' | 'edit';
}

// Tipos de cama com capacidade
const BED_TYPES = [
  { value: 'solteiro', label: 'Solteiro', capacity: 1, icon: '🛏️' },
  { value: 'casal', label: 'Casal', capacity: 2, icon: '🛏️' },
  { value: 'queen', label: 'Queen', capacity: 2, icon: '🛏️' },
  { value: 'king', label: 'King', capacity: 2, icon: '🛏️' },
  { value: 'beliche', label: 'Beliche', capacity: 2, icon: '🪜' },
  { value: 'sofa-cama', label: 'Sofá-cama', capacity: 1, icon: '🛋️' },
];

interface BedConfig {
  id: string;
  type: string;
  quantity: number;
}

const VIEW_TYPES = [
  { value: 'oceano', label: 'Oceano' },
  { value: 'cidade', label: 'Cidade' },
  { value: 'jardim', label: 'Jardim' },
  { value: 'montanha', label: 'Montanha' },
  { value: 'piscina', label: 'Piscina' },
  { value: 'interna', label: 'Vista Interna' },
];

const ROOM_TYPES = [
  { value: 'standard', label: 'Prédio Principal' },
  { value: 'anexo', label: 'Anexo' },
  { value: 'pousada', label: 'Pousada' },
  { value: 'suite', label: 'Suíte' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'executive', label: 'Executive' },
];

export function RoomEditDialog({ open, onOpenChange, room, onSave, mode }: RoomEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [bedConfigs, setBedConfigs] = useState<BedConfig[]>([
    { id: '1', type: 'solteiro', quantity: 1 }
  ]);
  
  const [formData, setFormData] = useState<Partial<Room>>({
    number: 0,
    type: 'standard',
    floor: 0,
    capacity: 2,
    beds: 1,
    custom_name: '',
    daily_rate: undefined,
    room_size: undefined,
    status: 'available',
    // Amenidades principais
    has_minibar: false,
    has_ac: false,
    has_tv: false,
    has_wifi: false,
    has_balcony: false,
    // Amenidades banheiro
    has_bathtub: false,
    has_hairdryer: false,
    // Amenidades extras
    has_safe: false,
    has_phone: false,
    has_bathrobe: false,
    // Características especiais
    view_type: undefined,
    is_accessible: false,
    is_smoking_allowed: false,
    is_pet_friendly: false,
  });

  useEffect(() => {
    if (room && mode === 'edit') {
      console.log('🔍 Carregando quarto para edição:', room);
      console.log('🛏️ bed_configuration:', room.bed_configuration);
      
      // Inicializar configuração de camas do banco (se existir) ou estimar
      let initialBeds: BedConfig[] = [];
      
      // Prioridade 1: Usar configuração salva no banco
      if (room.bed_configuration && Array.isArray(room.bed_configuration) && room.bed_configuration.length > 0) {
        console.log('✅ Usando configuração salva no banco');
        initialBeds = room.bed_configuration.map((bed: any) => ({
          id: bed.id || String(Date.now() + Math.random()),
          type: bed.type || 'solteiro',
          quantity: bed.quantity || 1
        }));
      } else {
        console.log('⚠️ Estimando camas baseado em beds:', room.beds, 'capacity:', room.capacity);
        // Prioridade 2: Estimar baseado em beds e capacity
        const totalBeds = room.beds || 1;
        
        if (totalBeds === 1) {
          initialBeds.push({
            id: '1',
            type: (room.capacity || 0) >= 2 ? 'casal' : 'solteiro',
            quantity: 1
          });
        } else {
          // Múltiplas camas - dividir entre casal e solteiro
          const casalBeds = Math.floor(totalBeds / 2);
          const solteiroBeds = totalBeds % 2;
          
          if (casalBeds > 0) {
            initialBeds.push({ id: '1', type: 'casal', quantity: casalBeds });
          }
          if (solteiroBeds > 0) {
            initialBeds.push({ id: '2', type: 'solteiro', quantity: solteiroBeds });
          }
        }
      }
      
      setBedConfigs(initialBeds.length > 0 ? initialBeds : [{ id: '1', type: 'solteiro', quantity: 1 }]);
      
      setFormData({
        number: room.number,
        type: room.type || 'standard',
        floor: room.floor || 0,
        capacity: room.capacity || 2,
        beds: room.beds || 1,
        custom_name: room.custom_name || '',
        daily_rate: room.daily_rate,
        room_size: room.room_size,
        status: room.status,
        // Amenidades
        has_minibar: room.has_minibar || false,
        has_ac: room.has_ac || false,
        has_tv: room.has_tv || false,
        has_wifi: room.has_wifi || false,
        has_balcony: room.has_balcony || false,
        has_bathtub: room.has_bathtub || false,
        has_hairdryer: room.has_hairdryer || false,
        has_safe: room.has_safe || false,
        has_phone: room.has_phone || false,
        has_bathrobe: room.has_bathrobe || false,
        view_type: room.view_type,
        is_accessible: room.is_accessible || false,
        is_smoking_allowed: room.is_smoking_allowed || false,
        is_pet_friendly: room.is_pet_friendly || false,
      });
    } else if (mode === 'create') {
      // Reset para valores padrão ao criar
      setBedConfigs([{ id: '1', type: 'solteiro', quantity: 1 }]);
      
      setFormData({
        number: 0,
        type: 'standard',
        floor: 0,
        capacity: 2,
        beds: 1,
        custom_name: '',
        daily_rate: undefined,
        room_size: undefined,
        status: 'available',
        has_minibar: false,
        has_ac: false,
        has_tv: false,
        has_wifi: false,
        has_balcony: false,
        has_bathtub: false,
        has_hairdryer: false,
        has_safe: false,
        has_phone: false,
        has_bathrobe: false,
        view_type: undefined,
        is_accessible: false,
        is_smoking_allowed: false,
        is_pet_friendly: false,
      });
    }
  }, [room, mode, open]);

  // Calcular capacidade e total de camas automaticamente
  const calculateCapacityAndBeds = (beds: BedConfig[]) => {
    let totalCapacity = 0;
    let totalBeds = 0;
    
    beds.forEach(bed => {
      const bedType = BED_TYPES.find(bt => bt.value === bed.type);
      if (bedType) {
        totalCapacity += bedType.capacity * bed.quantity;
        totalBeds += bed.quantity;
      }
    });
    
    return { capacity: totalCapacity, beds: totalBeds };
  };

  // Atualizar capacidade quando camas mudarem
  useEffect(() => {
    const { capacity, beds } = calculateCapacityAndBeds(bedConfigs);
    setFormData(prev => ({ ...prev, capacity, beds }));
  }, [bedConfigs]);

  const addBedConfig = () => {
    setBedConfigs(prev => [
      ...prev,
      { id: Date.now().toString(), type: 'solteiro', quantity: 1 }
    ]);
  };

  const removeBedConfig = (id: string) => {
    setBedConfigs(prev => prev.filter(bed => bed.id !== id));
  };

  const updateBedConfig = (id: string, field: 'type' | 'quantity', value: string | number) => {
    setBedConfigs(prev => prev.map(bed => 
      bed.id === id ? { ...bed, [field]: value } : bed
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Incluir configuração de camas no formData
      const dataToSave = {
        ...formData,
        bed_configuration: bedConfigs
      };
      await onSave(dataToSave);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar quarto:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = <K extends keyof Room>(field: K, value: Room[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[60vw] w-[60vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Adicionar Novo Quarto' : `Editar Quarto ${room?.number}`}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Preencha os dados do novo quarto e suas amenidades'
              : 'Atualize as informações e amenidades do quarto'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SEÇÃO 1: Informações Básicas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-slate-600" />
              <h3 className="font-semibold text-lg">Informações Básicas</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Número do Quarto *</Label>
                <Input
                  id="number"
                  type="number"
                  required
                  value={formData.number || ''}
                  onChange={e => updateField('number', parseInt(e.target.value) || 0)}
                  placeholder="101"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type || 'standard'} onValueChange={value => updateField('type', value)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">Andar</Label>
                <Input
                  id="floor"
                  type="number"
                  value={formData.floor || 0}
                  onChange={e => updateField('floor', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="custom_name">Nome Personalizado</Label>
                <Input
                  id="custom_name"
                  value={formData.custom_name || ''}
                  onChange={e => updateField('custom_name', e.target.value)}
                  placeholder="Ex: Suíte Presidencial"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status || 'available'} onValueChange={value => updateField('status', value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="occupied">Ocupado</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="cleaning">Limpeza</SelectItem>
                    <SelectItem value="reserved">Reservado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Bed className="h-5 w-5" />
                  Configuração de Camas
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBedConfig}
                  className="h-9 px-4 gap-2 font-medium min-w-fit whitespace-nowrap rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Cama
                </Button>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border">
                {bedConfigs.map((bed, index) => (
                  <div key={bed.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border">
                    <span className="text-sm font-medium text-slate-600 min-w-[60px]">
                      Cama {index + 1}
                    </span>
                    <Select 
                      value={bed.type} 
                      onValueChange={value => updateBedConfig(bed.id, 'type', value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BED_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label} ({type.capacity} {type.capacity === 1 ? 'pessoa' : 'pessoas'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-slate-600">Qtd:</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={bed.quantity}
                        onChange={e => updateBedConfig(bed.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                    </div>
                    {bedConfigs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBedConfig(bed.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-slate-600" />
                      <span className="font-medium">Total de Camas:</span>
                      <span className="font-bold text-blue-600">{formData.beds || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-600" />
                      <span className="font-medium">Capacidade Total:</span>
                      <span className="font-bold text-green-600">{formData.capacity || 0} {(formData.capacity || 0) === 1 ? 'pessoa' : 'pessoas'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="daily_rate" className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Diária (R$)
                </Label>
                <Input
                  id="daily_rate"
                  type="number"
                  step="0.01"
                  value={formData.daily_rate || ''}
                  onChange={e => updateField('daily_rate', parseFloat(e.target.value) || undefined)}
                  placeholder="150.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room_size" className="flex items-center gap-1">
                  <Maximize2 className="h-4 w-4" />
                  Área (m²)
                </Label>
                <Input
                  id="room_size"
                  type="number"
                  step="0.01"
                  value={formData.room_size || ''}
                  onChange={e => updateField('room_size', parseFloat(e.target.value) || undefined)}
                  placeholder="25.00"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* SEÇÃO 2: Amenidades Principais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Amenidades Principais</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                <Label htmlFor="has_tv" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Tv className="h-5 w-5 text-slate-600" />
                  <span>TV</span>
                </Label>
                <Switch
                  id="has_tv"
                  checked={formData.has_tv || false}
                  onCheckedChange={checked => updateField('has_tv', checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                <Label htmlFor="has_ac" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Wind className="h-5 w-5 text-slate-600" />
                  <span>Ar-condicionado</span>
                </Label>
                <Switch
                  id="has_ac"
                  checked={formData.has_ac || false}
                  onCheckedChange={checked => updateField('has_ac', checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                <Label htmlFor="has_wifi" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Wifi className="h-5 w-5 text-slate-600" />
                  <span>Wi-Fi</span>
                </Label>
                <Switch
                  id="has_wifi"
                  checked={formData.has_wifi || false}
                  onCheckedChange={checked => updateField('has_wifi', checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                <Label htmlFor="has_minibar" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Wine className="h-5 w-5 text-slate-600" />
                  <span>Frigobar</span>
                </Label>
                <Switch
                  id="has_minibar"
                  checked={formData.has_minibar || false}
                  onCheckedChange={checked => updateField('has_minibar', checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                <Label htmlFor="has_balcony" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Home className="h-5 w-5 text-slate-600" />
                  <span>Varanda</span>
                </Label>
                <Switch
                  id="has_balcony"
                  checked={formData.has_balcony || false}
                  onCheckedChange={checked => updateField('has_balcony', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* SEÇÃO 3: Amenidades Banheiro & Extras */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Amenidades Banheiro & Extras</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                <Label htmlFor="has_bathtub" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Bath className="h-5 w-5 text-slate-600" />
                  <span>Banheira</span>
                </Label>
                <Switch
                  id="has_bathtub"
                  checked={formData.has_bathtub || false}
                  onCheckedChange={checked => updateField('has_bathtub', checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                <Label htmlFor="has_hairdryer" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Dryer className="h-5 w-5 text-slate-600" />
                  <span>Secador</span>
                </Label>
                <Switch
                  id="has_hairdryer"
                  checked={formData.has_hairdryer || false}
                  onCheckedChange={checked => updateField('has_hairdryer', checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                <Label htmlFor="has_safe" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Lock className="h-5 w-5 text-slate-600" />
                  <span>Cofre</span>
                </Label>
                <Switch
                  id="has_safe"
                  checked={formData.has_safe || false}
                  onCheckedChange={checked => updateField('has_safe', checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                <Label htmlFor="has_phone" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Phone className="h-5 w-5 text-slate-600" />
                  <span>Telefone</span>
                </Label>
                <Switch
                  id="has_phone"
                  checked={formData.has_phone || false}
                  onCheckedChange={checked => updateField('has_phone', checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                <Label htmlFor="has_bathrobe" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Bathrobe className="h-5 w-5 text-slate-600" />
                  <span>Roupão</span>
                </Label>
                <Switch
                  id="has_bathrobe"
                  checked={formData.has_bathrobe || false}
                  onCheckedChange={checked => updateField('has_bathrobe', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* SEÇÃO 4: Características Especiais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Características Especiais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="view_type" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Tipo de Vista
                </Label>
                <Select value={formData.view_type || 'none'} onValueChange={value => updateField('view_type', value === 'none' ? undefined : value)}>
                  <SelectTrigger id="view_type">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {VIEW_TYPES.map(view => (
                      <SelectItem key={view.value} value={view.value}>
                        {view.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                <Label htmlFor="is_accessible" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Accessibility className="h-5 w-5 text-slate-600" />
                  <span>Acessível (PCD)</span>
                </Label>
                <Switch
                  id="is_accessible"
                  checked={formData.is_accessible || false}
                  onCheckedChange={checked => updateField('is_accessible', checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                <Label htmlFor="is_smoking_allowed" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Cigarette className="h-5 w-5 text-slate-600" />
                  <span>Permite Fumar</span>
                </Label>
                <Switch
                  id="is_smoking_allowed"
                  checked={formData.is_smoking_allowed || false}
                  onCheckedChange={checked => updateField('is_smoking_allowed', checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                <Label htmlFor="is_pet_friendly" className="flex items-center gap-2 cursor-pointer flex-1">
                  <PawPrint className="h-5 w-5 text-slate-600" />
                  <span>Pet Friendly</span>
                </Label>
                <Switch
                  id="is_pet_friendly"
                  checked={formData.is_pet_friendly || false}
                  onCheckedChange={checked => updateField('is_pet_friendly', checked)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={loading}
              className="h-10 px-4 rounded-lg font-medium min-w-fit whitespace-nowrap"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="h-10 px-4 rounded-lg font-medium min-w-fit whitespace-nowrap gap-2"
            >
              {loading ? 'Salvando...' : mode === 'create' ? 'Criar Quarto' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
