import { pricingConfig } from './pricing';

export type CableType = keyof typeof pricingConfig.cables;
export type TerrainType = keyof typeof pricingConfig.terrains;
export type JobType = 'cable_connection' | 'move_meter' | 'overhead_to_cable' | 'power_increase' | 'building_site';

export interface MultiEstimateInput {
  jobType: JobType;
  length: number;
  cableType: CableType;
  terrainType: TerrainType;
  depth: number;
  conduitsCount: number;
  meterBoxOwned?: 'yes' | 'no';
  vatRate?: 0.08 | 0.23;
}

export interface CostItem {
  name: string;
  unit: string;
  qty: number;
  priceNet: number;
  totalNet: number;
}

export interface EstimateResult {
  items: CostItem[];
  summary: {
    subTotalNet: number;
    markup: number;
    totalNet: number;
    vat: number;
    totalBrutto: number;
  };
}

export type EstimateInput = Omit<MultiEstimateInput, 'jobType'>;

function createCostItem(item: { name: string; unit: string; price: number }, qty: number, priceNet?: number): CostItem {
  const unitPrice = priceNet ?? item.price;
  const totalNet = Number((qty * unitPrice).toFixed(2));
  return {
    name: item.name,
    unit: item.unit,
    qty,
    priceNet: Number(unitPrice.toFixed(2)),
    totalNet
  };
}

export function calculateMultiEstimate(input: MultiEstimateInput): EstimateResult {
  const items: CostItem[] = [];
  const { jobType, length, cableType, terrainType, depth, conduitsCount, meterBoxOwned = 'no', vatRate = pricingConfig.vat_rate } = input;
  const selectedTerrain = pricingConfig.terrains[terrainType] ?? pricingConfig.terrains.earth;
  const selectedCable = pricingConfig.cables[cableType];

  if (!selectedCable && length > 0) {
    throw new Error(`Wybierz poprawny rodzaj kabla ze specyfikacji TAURON.`);
  }

  const width = 0.8;
  const volume = Number((length * width * depth).toFixed(2));
  const cableLengthWithSlack = Number((length * 1.04).toFixed(2));
  const conduitLength = Number(conduitsCount.toFixed(2));

  const earthWorkJob: JobType[] = ['cable_connection', 'overhead_to_cable', 'move_meter', 'power_increase'];

  if (length > 0 && earthWorkJob.includes(jobType)) {
    const excavationPrice = Number((pricingConfig.items.excavation_base.price * selectedTerrain.labor_multiplier).toFixed(2));
    items.push(createCostItem({ name: `${pricingConfig.items.excavation_base.name} - ${selectedTerrain.name}`, unit: pricingConfig.items.excavation_base.unit, price: excavationPrice }, volume, excavationPrice));
    items.push(createCostItem(pricingConfig.items.sand_bedding, Number((length * width * 0.1).toFixed(2))));
    items.push(createCostItem({ name: `Kabel elektroenergetyczny: ${selectedCable.name}`, unit: 'm', price: selectedCable.price_net }, cableLengthWithSlack));
    items.push(createCostItem(pricingConfig.items.cable_laying, Number(length.toFixed(2))));
    items.push(createCostItem(pricingConfig.items.warning_tape, Number(length.toFixed(2))));
    items.push(createCostItem(pricingConfig.items.backfill_and_compact, volume));

    if (terrainType === 'paving') {
      items.push(createCostItem(pricingConfig.items.surface_restore_paving, Number(length.toFixed(2))));
    }

    if (terrainType === 'asphalt') {
      items.push(createCostItem(pricingConfig.items.surface_restore_asphalt, Number(length.toFixed(2))));
    }

    if (conduitLength > 0) {
      items.push(createCostItem(pricingConfig.items.conduit_pipe, conduitLength));
    }
  }

  switch (jobType) {
    case 'cable_connection':
      if (meterBoxOwned !== 'yes') {
        items.push(createCostItem(pricingConfig.items.zkp_freestanding, 1));
      }
      break;
    case 'move_meter':
      if (meterBoxOwned !== 'yes') {
        items.push(createCostItem(pricingConfig.items.box_surface, 1));
      }
      items.push(createCostItem(pricingConfig.items.cut_and_reconnect, 1));
      break;
    case 'overhead_to_cable':
      if (meterBoxOwned !== 'yes') {
        items.push(createCostItem(pricingConfig.items.zkp_freestanding, 1));
      }
      items.push(createCostItem(pricingConfig.items.pion_slup, 1));
      break;
    case 'power_increase':
      items.push(createCostItem(pricingConfig.items.switchboard_mod, 1));
      if (length > 0) {
        items.push(createCostItem(pricingConfig.items.cut_and_reconnect, 1));
      }
      break;
    case 'building_site':
      items.push(createCostItem(pricingConfig.items.erbetka_set, 1));
      break;
  }

  items.push(createCostItem(pricingConfig.items.measurements, 1));
  items.push(createCostItem(pricingConfig.items.ost_document, 1));

  const subTotalNet = Number(items.reduce((acc, item) => acc + item.totalNet, 0).toFixed(2));
  const markupValue = Number((subTotalNet * pricingConfig.company_markup_pct).toFixed(2));
  const totalNet = Number((subTotalNet + markupValue).toFixed(2));
  const vatValue = Number((totalNet * vatRate).toFixed(2));
  const totalBrutto = Number((totalNet + vatValue).toFixed(2));

  return {
    items,
    summary: {
      subTotalNet,
      markup: markupValue,
      totalNet,
      vat: vatValue,
      totalBrutto
    }
  };
}

export function calculateEstimate(input: Omit<MultiEstimateInput, 'jobType'>): EstimateResult {
  return calculateMultiEstimate({ jobType: 'cable_connection', ...input });
}
