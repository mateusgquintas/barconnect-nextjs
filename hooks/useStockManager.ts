import { useProductsDB } from './useProductsDB';
import { OrderItem } from '@/types';
import { toast } from 'sonner';

export function useStockManager() {
  const { updateStock } = useProductsDB();

  const decreaseStock = async (items: OrderItem[]) => {
    try {
      for (const item of items) {
        const currentStock = item.product.stock;
        const newStock = Math.max(0, currentStock - item.quantity);
        
        await updateStock(item.product.id, newStock);
        
        if (newStock === 0) {
          toast.warning(`${item.product.name} ficou sem estoque`);
        } else if (newStock <= 5) {
          toast.warning(`${item.product.name} com estoque baixo (${newStock})`);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      toast.error('Erro ao atualizar estoque');
    }
  };

  return { decreaseStock };
}