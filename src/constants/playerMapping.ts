export interface PlayerMapEntry {
  name: string;
  seleccion: string;
}

export const playerMapping: Record<number, PlayerMapEntry | undefined> = {
  10: { name: 'Lionel Messi', seleccion: 'argentina' },
  45: { name: 'Emiliano Martínez', seleccion: 'argentina' },
  88: { name: 'Rodrigo De Paul', seleccion: 'argentina' },
  128: { name: 'Lionel Messi', seleccion: 'argentina' },
  210: { name: 'Kylian Mbappé', seleccion: 'francia' },
  7: { name: 'Cristiano Ronaldo', seleccion: 'portugal' },
  9: { name: 'Erling Haaland', seleccion: 'noruega' },
  11: { name: 'Neymar Jr', seleccion: 'brasil' },
  1: { name: 'Franco Armani', seleccion: 'argentina' },
  2: { name: 'Cristian Romero', seleccion: 'argentina' },
  3: { name: 'Nicolás Tagliafico', seleccion: 'argentina' },
  4: { name: 'Gonzalo Montiel', seleccion: 'argentina' },
  5: { name: 'Leandro Paredes', seleccion: 'argentina' },
  6: { name: 'Germán Pezzella', seleccion: 'argentina' },
  8: { name: 'Marcos Acuña', seleccion: 'argentina' },
  19: { name: 'Nicolás Otamendi', seleccion: 'argentina' },
  20: { name: 'Alexis Mac Allister', seleccion: 'argentina' },
  22: { name: 'Lautaro Martínez', seleccion: 'argentina' },
  24: { name: 'Enzo Fernández', seleccion: 'argentina' },
  26: { name: 'Nahuel Molina', seleccion: 'argentina' },
};
