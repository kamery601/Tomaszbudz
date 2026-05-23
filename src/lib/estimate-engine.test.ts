import { describe, expect, it } from 'vitest';
import { calculateEstimate, calculateMultiEstimate } from '@/lib/estimate-engine';

describe('calculateMultiEstimate', () => {
  it('calculates a standard cable connection with terrain and conduit', () => {
    const result = calculateMultiEstimate({
      jobType: 'cable_connection',
      length: 50,
      cableType: 'YAKY_4x35',
      terrainType: 'difficult',
      depth: 0.8,
      conduitsCount: 2
    });

    expect(result.summary.subTotalNet).toBeGreaterThan(0);
    expect(result.summary.totalBrutto).toBeGreaterThan(result.summary.totalNet);
    expect(result.items.some((item) => item.name.includes('Kabel elektroenergetyczny'))).toBe(true);
    expect(result.items.some((item) => item.name.includes('Rura osłonowa przepustowa'))).toBe(true);
  });

  it('calculates building site estimate without earthworks cost', () => {
    const result = calculateMultiEstimate({
      jobType: 'building_site',
      length: 0,
      cableType: 'YAKY_4x35',
      terrainType: 'earth',
      depth: 0.7,
      conduitsCount: 0
    });

    expect(result.items.some((item) => item.name.includes('Erbetka'))).toBe(true);
    expect(result.summary.subTotalNet).toBeGreaterThan(0);
  });

  it('calculates move meter estimate with service cabinet and reconnection', () => {
    const result = calculateMultiEstimate({
      jobType: 'move_meter',
      length: 15,
      cableType: 'YAKY_4x35',
      terrainType: 'paving',
      depth: 0.8,
      conduitsCount: 1
    });

    expect(result.items.some((item) => item.name.includes('szafy licznikowej'))).toBe(true);
    expect(result.items.some((item) => item.name.includes('Przełączenie zasilania'))).toBe(true);
    expect(result.summary.totalBrutto).toBeGreaterThan(result.summary.totalNet);
  });

  it('calculates overhead to cable transition estimate', () => {
    const result = calculateMultiEstimate({
      jobType: 'overhead_to_cable',
      length: 25,
      cableType: 'YAKY_4x50',
      terrainType: 'asphalt',
      depth: 0.7,
      conduitsCount: 0
    });

    expect(result.items.some((item) => item.name.includes('ZKP-1'))).toBe(true);
    expect(result.items.some((item) => item.name.includes('Wykonanie podejścia kablowego na słupie'))).toBe(true);
    expect(result.summary.subTotalNet).toBeGreaterThan(0);
  });

  it('calculates power increase estimate with a cut and reconnect job', () => {
    const result = calculateMultiEstimate({
      jobType: 'power_increase',
      length: 10,
      cableType: 'YKY_5x16',
      terrainType: 'earth',
      depth: 0.7,
      conduitsCount: 0
    });

    expect(result.items.some((item) => item.name.includes('Modernizacja głównej tablicy rozdzielczej'))).toBe(true);
    expect(result.items.some((item) => item.name.includes('Przełączenie zasilania'))).toBe(true);
  });

  it('calculateEstimate alias creates a cable connection estimate', () => {
    const result = calculateEstimate({
      length: 10,
      cableType: 'YKY_5x10',
      terrainType: 'earth',
      depth: 0.7,
      conduitsCount: 0
    });

    expect(result.items.some((item) => item.name.includes('Kabel elektroenergetyczny'))).toBe(true);
    expect(result.summary.totalNet).toBeGreaterThan(0);
  });
});
