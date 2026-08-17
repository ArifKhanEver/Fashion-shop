import { getCoupons } from "@/actions/admin.coupon.actions";
import AdminCouponsClient from "./AdminCouponsClient";

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();
  return <AdminCouponsClient coupons={coupons as any} />;
}
