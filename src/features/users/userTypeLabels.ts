import { UserType } from "./usersApi";

export const userTypeLabels: Record<UserType, string> = {
  [UserType.Customer]: "Müşteri",
  [UserType.FreeBarber]: "Bağımsız Berber",
  [UserType.BarberStore]: "Berber Salonu",
};

export const userTypeBadgeColor: Record<UserType, "primary" | "success" | "info"> = {
  [UserType.Customer]: "info",
  [UserType.FreeBarber]: "success",
  [UserType.BarberStore]: "primary",
};
