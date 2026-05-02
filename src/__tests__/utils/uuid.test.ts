import { generateId } from '../../utils/uuid';

describe('generateId', () => {
  it('retorna uma string', () => {
    expect(typeof generateId()).toBe('string');
  });

  it('retorna UUID no formato v4', () => {
    const uuid = generateId();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it('gera valores únicos a cada chamada', () => {
    const ids = Array.from({ length: 100 }, generateId);
    const unicos = new Set(ids);
    expect(unicos.size).toBe(100);
  });

  it('contém exatamente 4 hífens', () => {
    const uuid = generateId();
    expect(uuid.split('-')).toHaveLength(5);
  });

  it('o terceiro segmento começa com 4 (versão 4)', () => {
    const uuid = generateId();
    const segmentos = uuid.split('-');
    expect(segmentos[2]).toMatch(/^4/);
  });
});
