export interface PricingItem {
  name: string;
  unit: string;
  price: number;
  type: 'material' | 'labor' | 'equipment' | 'combined';
}

export interface TerrainDefinition {
  name: string;
  labor_multiplier: number;
}

export interface CableDefinition {
  name: string;
  price_net: number;
}

export interface PricingConfig {
  currency: 'PLN';
  vat_rate: number;
  company_markup_pct: number;
  terrains: Record<string, TerrainDefinition>;
  cables: Record<string, CableDefinition>;
  items: Record<string, PricingItem>;
}

export const pricingConfig: PricingConfig = {
  currency: 'PLN',
  vat_rate: 0.23,
  company_markup_pct: 0.15,
  terrains: {
    earth: { name: 'Ziemia (nieutwardzony)', labor_multiplier: 1.0 },
    roots: { name: 'Ziemia utrudniona (korzenie, skarpa)', labor_multiplier: 1.4 },
    paving: { name: 'Kostka brukowa (+demontaż i odtworzenie)', labor_multiplier: 1.2 },
    asphalt: { name: 'Asfalt (+cięcie i odtworzenie)', labor_multiplier: 1.3 },
    difficult: { name: 'Kamienie / Podhale', labor_multiplier: 2.0 },
    rock: { name: 'Skała wymagająca kucia', labor_multiplier: 3.5 }
  },
  cables: {
    YAKY_4x35: { name: 'YAKY 4x35 mm² (Aluminium - standard przyłącza domowego)', price_net: 14.5 },
    YAKY_4x50: { name: 'YAKY 4x50 mm² (Aluminium - zwiększony przydział mocy)', price_net: 19.8 },
    YAKXS_4x70: { name: 'YAKXS 4x70 mm² (Aluminium - większe moce / pensjonat / usługi)', price_net: 38.0 },
    YAKXS_4x120: { name: 'YAKXS 4x120 mm² (Aluminium - większy obiekt usługowy)', price_net: 70.0 },
    YAKXS_4x240: { name: 'YAKXS 4x240 mm² (Aluminium - duża moc / wyciąg / większy obiekt)', price_net: 135.0 },
    YKY_5x10: { name: 'YKY 5x10 mm² (Miedź - standardowy WLZ do domu)', price_net: 34.0 },
    YKY_5x16: { name: 'YKY 5x16 mm² (Miedź - gruby WLZ pod pompy ciepła)', price_net: 52.0 }
  },
  items: {
    excavation_base: { name: 'Wykop liniowy ręczny/mechaniczny pod kabel (szer. 0.8m, głęb. 0.7m)', unit: 'm³', price: 90.0, type: 'labor' },
    sand_bedding: { name: 'Podsypka piaskowa (warstwa ochronna 10 cm)', unit: 'm³', price: 120.0, type: 'combined' },
    cable_laying: { name: 'Układanie kabla w wykopie', unit: 'm', price: 25.0, type: 'labor' },
    warning_tape: { name: 'Folia ostrzegawcza niebieska z ułożeniem', unit: 'm', price: 3.5, type: 'combined' },
    backfill_and_compact: { name: 'Zasypanie wykopu z zagęszczeniem mechanicznym (skoczek/zagęszczarka)', unit: 'm³', price: 60.0, type: 'combined' },
    surface_restore_paving: { name: 'Demontaż i odtworzenie kostki brukowej', unit: 'm', price: 120.0, type: 'combined' },
    surface_restore_asphalt: { name: 'Cięcie i odtworzenie nawierzchni asfaltowej', unit: 'm', price: 250.0, type: 'combined' },
    conduit_pipe: { name: 'Rura osłonowa przepustowa (Arota 110)', unit: 'm', price: 45.0, type: 'material' },
    zkp_freestanding: { name: 'Dostawa i montaż szafy złączowo-pomiarowej ZKP-1 na fundamencie w granicy działki', unit: 'szt.', price: 2200.0, type: 'combined' },
    box_surface: { name: 'Dostawa i montaż szafy licznikowej zewnętrznej, natynkowej/wtynkowej na elewacji', unit: 'szt.', price: 1100.0, type: 'combined' },
    erbetka_set: { name: 'Przygotowanie przyłącza budowlanego: rozdzielnica budowlana (Erbetka) na stojaku wraz z osprzętem i uziemieniem', unit: 'kpl.', price: 1450.0, type: 'combined' },
    pion_slup: { name: 'Wykonanie podejścia kablowego na słupie TAURON (rura ochronna UV do 3m + uchwyty + najazd)', unit: 'kpl.', price: 850.0, type: 'combined' },
    switchboard_mod: { name: 'Modernizacja głównej tablicy rozdzielczej w domu (wymiana aparatury pod 3 fazy/siłę, nowe zabezpieczenia przedlicznikowe)', unit: 'kpl.', price: 1200.0, type: 'combined' },
    cut_and_reconnect: { name: 'Przełączenie zasilania ze starego licznika wewnętrznego do nowego układu zewnętrznego (przeróbka głównego zasilania budynku)', unit: 'kpl.', price: 950.0, type: 'combined' },
    measurements: { name: 'Pomiary elektryczne powykonawcze (izolacja, pętla zwarcia, uziemienie erbetki/szafy) + protokół', unit: 'kpl.', price: 600.0, type: 'combined' },
    ost_document: { name: 'Przygotowanie pełnej dokumentacji: Wniosek OST (Oświadczenie o stanie technicznym), zgłoszenie gotowości instalacji do TAURON', unit: 'kpl.', price: 750.0, type: 'combined' }
  }
};

export type PricingUpdatePayload = {
  cables?: Record<string, number>;
  items?: Record<string, number>;
};

export function applyPricingUpdates(updates: PricingUpdatePayload) {
  if (updates.cables) {
    Object.entries(updates.cables).forEach(([key, value]) => {
      if (pricingConfig.cables[key] && typeof value === 'number' && !Number.isNaN(value)) {
        pricingConfig.cables[key].price_net = value;
      }
    });
  }

  if (updates.items) {
    Object.entries(updates.items).forEach(([key, value]) => {
      if (pricingConfig.items[key] && typeof value === 'number' && !Number.isNaN(value)) {
        pricingConfig.items[key].price = value;
      }
    });
  }
}
