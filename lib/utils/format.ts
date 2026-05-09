import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatData(value: string | Date) {
  return formatDistanceToNow(new Date(value), {
    addSuffix: true,
    locale: ptBR,
  });
}

export function formatTempo(value?: number | null) {
  if (!value) {
    return "Sem tempo definido";
  }

  return `${value} min`;
}

export function formatContagem(value: number) {
  if (value < 1000) {
    return String(value);
  }

  return `${(value / 1000).toFixed(1).replace(".0", "")}k`;
}
