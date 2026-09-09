import { z } from "zod";

/** Supabase oturumu açıldıktan sonra yerel User satırını oluşturur/döner. */
export const userProfileSchema = z.object({
  id: z.string(),
  authId: z.string(),
  email: z.string().nullable(),
  createdAt: z.string(),
});
export type UserProfile = z.infer<typeof userProfileSchema>;

/**
 * Hesap silme, geri dönüşü olmayan bir işlem. İstemcinin kazara göndermesini
 * engellemek için kullanıcıdan tam olarak bu ifadeyi yazması isteniyor.
 */
export const DELETE_ACCOUNT_CONFIRMATION = "HESABIMI SİL";

export const deleteAccountSchema = z.object({
  confirmation: z.literal(DELETE_ACCOUNT_CONFIRMATION),
});
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
