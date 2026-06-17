import { useState, useEffect, useRef } from "react";
import { X, ShoppingCart, ChefHat, BarChart2, Plus, Trash2, CheckCircle, RefreshCw, Download, Package, Printer } from "lucide-react";

// ─── MASTER DATA ──────────────────────────────────────────────────────────────

const variasiMenu = [
  { ID_Variasi: "VAR001", ID_Menu: "MNU001", Nama_Variasi: "Ceker", Harga: 4000 },
  { ID_Variasi: "VAR002", ID_Menu: "MNU001", Nama_Variasi: "Sosis", Harga: 2000 },
  { ID_Variasi: "VAR003", ID_Menu: "MNU001", Nama_Variasi: "Kerupuk", Harga: 1000 },
  { ID_Variasi: "VAR004", ID_Menu: "MNU001", Nama_Variasi: "Dumpling", Harga: 3000 },
  { ID_Variasi: "VAR009", ID_Menu: "MNU001", Nama_Variasi: "Kwetiau", Harga: 1500 },
  { ID_Variasi: "VAR010", ID_Menu: "MNU001", Nama_Variasi: "Makaroni", Harga: 1500 },
  { ID_Variasi: "VAR011", ID_Menu: "MNU001", Nama_Variasi: "Mie", Harga: 1500 },
  { ID_Variasi: "VAR012", ID_Menu: "MNU001", Nama_Variasi: "Sayuran", Harga: 2000 },
  { ID_Variasi: "VAR013", ID_Menu: "MNU001", Nama_Variasi: "Jamur Enoki", Harga: 2000 },
  { ID_Variasi: "VAR014", ID_Menu: "MNU001", Nama_Variasi: "Cuanki Tahu", Harga: 1000 },
  { ID_Variasi: "VAR015", ID_Menu: "MNU001", Nama_Variasi: "Siomay Kering", Harga: 500 },
  { ID_Variasi: "VAR016", ID_Menu: "MNU001", Nama_Variasi: "Sayap", Harga: 7500 },
  { ID_Variasi: "VAR005", ID_Menu: "MNU002", Nama_Variasi: "Teh", Harga: 5000 },
  { ID_Variasi: "VAR006", ID_Menu: "MNU002", Nama_Variasi: "Es Jeruk", Harga: 7000 },
  { ID_Variasi: "VAR007", ID_Menu: "MNU002", Nama_Variasi: "Es Matcha", Harga: 6000 },
  { ID_Variasi: "VAR008", ID_Menu: "MNU002", Nama_Variasi: "Kopi", Harga: 3000 },
];

const tingkatPedas = [
  { ID_Kepedasan: "KPD001", Nama_Level: "Tidak Pedas 😶", Skala: 1 },
  { ID_Kepedasan: "KPD002", Nama_Level: "Pedas Sedang 🌶️🌶️", Skala: 2 },
  { ID_Kepedasan: "KPD003", Nama_Level: "Sangat Pedas 🌶️🌶️🌶️", Skala: 3 },
  { ID_Kepedasan: "KPD004", Nama_Level: "Ekstra Pedas 🔥🔥🔥", Skala: 4 },
];

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface CartItem {
  isPackage: false;
  ID_Menu: string;
  ID_Variasi: string;
  NamaVariasi: string;
  HargaSatuan: number;
  Jumlah: number;
  ID_Kepedasan: string | null;
  NamaPedas: string | null;
  Subtotal: number;
}

interface CartPackage {
  isPackage: true;
  porsi: number;
  levelPedasId: string;
  levelPedasNama: string;
  variasiList: { ID_Variasi: string; NamaVariasi: string; HargaSatuan: number; SubtotalItem: number }[];
  Subtotal: number;
  deskripsi: string;
}

type CartEntry = CartItem | CartPackage;

interface Pesanan {
  ID_Pesanan: string;
  Tanggal: string;
  Waktu: string;
  Nama_Pelanggan: string;
  Total_Harga: number;
  Layanan: string;
}

interface DetailPesanan {
  ID_Detail: string;
  ID_Pesanan: string;
  ID_Menu: string;
  ID_Variasi: string;
  ID_Kepedasan: string | null;
  Jumlah: number;
  Harga_Satuan: number;
  Subtotal: number;
}

interface Antrian {
  ID_Antrian: string;
  ID_Pesanan: string;
  Nomor_Antrian: string;
  Waktu_Masuk: string;
  Status_Antrian: string;
  Waktu_Selesai: string | null;
}

interface Transaksi {
  ID_Transaksi: string;
  ID_Pesanan: string;
  Tanggal_Waktu: string;
  Jumlah_Dibayar: number;
  Metode_Bayar: string;
  Status: string;
  Kembalian: number;
}

interface Struk {
  Nomor_Struk: string;
  ID_Transaksi: string;
  ID_Pesanan: string;
  Tanggal_Waktu: string;
  Total_Bayar: number;
  Metode_Bayar: string;
  Kembalian: number;
}

interface StrukModal {
  struk: Struk;
  detailItems: { NamaVariasi: string; Jumlah: number; NamaPedas: string | null; Subtotal: number }[];
  nomorAntrian: string;
  namaPelanggan: string;
  layanan: string;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function rp(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function genId(prefix: string, arr: { [k: string]: string }[], field: string) {
  let max = 0;
  for (const item of arr) {
    const num = parseInt(item[field].replace(prefix, "")) || 0;
    if (num > max) max = num;
  }
  return prefix + (max + 1).toString().padStart(3, "0");
}

function nowDateTime() {
  const now = new Date();
  const tanggal = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;
  const waktu = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  return { tanggal, waktu };
}

const INIT_PESANAN: Pesanan[] = [
  { ID_Pesanan: "PSN001", Tanggal: "01/06/2025", Waktu: "10:30", Nama_Pelanggan: "Ihsan", Total_Harga: 9000, Layanan: "Dine In" },
  { ID_Pesanan: "PSN002", Tanggal: "01/06/2025", Waktu: "11:30", Nama_Pelanggan: "Rafi", Total_Harga: 5000, Layanan: "Take Away" },
];
const INIT_DETAIL: DetailPesanan[] = [
  { ID_Detail: "DTL001", ID_Pesanan: "PSN001", ID_Menu: "MNU001", ID_Variasi: "VAR001", ID_Kepedasan: "KPD001", Jumlah: 1, Harga_Satuan: 4000, Subtotal: 4000 },
  { ID_Detail: "DTL002", ID_Pesanan: "PSN001", ID_Menu: "MNU002", ID_Variasi: "VAR005", ID_Kepedasan: null, Jumlah: 1, Harga_Satuan: 5000, Subtotal: 5000 },
  { ID_Detail: "DTL003", ID_Pesanan: "PSN002", ID_Menu: "MNU001", ID_Variasi: "VAR003", ID_Kepedasan: "KPD003", Jumlah: 5, Harga_Satuan: 1000, Subtotal: 5000 },
];
const INIT_ANTRIAN: Antrian[] = [
  { ID_Antrian: "ANT001", ID_Pesanan: "PSN001", Nomor_Antrian: "A01", Waktu_Masuk: "10:30", Status_Antrian: "Selesai", Waktu_Selesai: "10:55" },
  { ID_Antrian: "ANT002", ID_Pesanan: "PSN002", Nomor_Antrian: "A02", Waktu_Masuk: "11:30", Status_Antrian: "Menunggu", Waktu_Selesai: null },
];
const INIT_TRANSAKSI: Transaksi[] = [
  { ID_Transaksi: "TRX001", ID_Pesanan: "PSN001", Tanggal_Waktu: "01/06/2025 10:30", Jumlah_Dibayar: 10000, Metode_Bayar: "Tunai", Status: "Lunas", Kembalian: 1000 },
  { ID_Transaksi: "TRX002", ID_Pesanan: "PSN002", Tanggal_Waktu: "01/06/2025 11:30", Jumlah_Dibayar: 5000, Metode_Bayar: "Qris", Status: "Lunas", Kembalian: 0 },
];
const INIT_STRUK: Struk[] = [
  { Nomor_Struk: "STR001", ID_Transaksi: "TRX001", ID_Pesanan: "PSN001", Tanggal_Waktu: "01/06/2025 10:30", Total_Bayar: 9000, Metode_Bayar: "Tunai", Kembalian: 1000 },
  { Nomor_Struk: "STR002", ID_Transaksi: "TRX002", ID_Pesanan: "PSN002", Tanggal_Waktu: "01/06/2025 11:30", Total_Bayar: 5000, Metode_Bayar: "Qris", Kembalian: 0 },
];

// ─── SUBCOMPONENTS ─────────────────────────────────────────────────────────────

function Badge({ children, color }: { children: React.ReactNode; color: "amber" | "green" | "red" | "blue" | "gray" }) {
  const colors = {
    amber: "bg-amber-100 text-amber-800",
    green: "bg-emerald-100 text-emerald-800",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-orange-100 ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, right }: { icon: React.ReactNode; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-orange-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
          {icon}
        </div>
        <h2 className="text-base font-bold text-gray-800">{title}</h2>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled = false, className = "" }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "success" | "warning" | "ghost" | "danger";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}) {
  const base = "inline-flex items-center gap-1.5 font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200",
    warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-200",
    danger: "bg-red-100 hover:bg-red-200 text-red-700",
    ghost: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, type = "text", className = "" }: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border border-orange-200 bg-orange-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 transition-all ${className}`}
    />
  );
}

function Select({ value, onChange, children, className = "" }: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full border border-orange-200 bg-orange-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 transition-all ${className}`}
    >
      {children}
    </select>
  );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}

// ─── PAKET MODAL ─────────────────────────────────────────────────────────────

function PaketModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (pkg: CartPackage) => void;
}) {
  const seblakVars = variasiMenu.filter(v => v.ID_Menu === "MNU001");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [porsi, setPorsi] = useState(1);
  const [levelPedas, setLevelPedas] = useState("KPD002");

  function toggleVar(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleAdd() {
    if (selected.size === 0) return;
    const levelObj = tingkatPedas.find(l => l.ID_Kepedasan === levelPedas)!;
    const variasiList = [...selected].map(id => {
      const v = variasiMenu.find(x => x.ID_Variasi === id)!;
      return { ID_Variasi: id, NamaVariasi: v.Nama_Variasi, HargaSatuan: v.Harga, SubtotalItem: v.Harga * porsi };
    });
    const total = variasiList.reduce((s, v) => s + v.SubtotalItem, 0);
    const deskripsi = `Seblak Paket (${variasiList.map(v => v.NamaVariasi).join(", ")}) x${porsi} porsi – ${levelObj.Nama_Level}`;
    onAdd({ isPackage: true, porsi, levelPedasId: levelPedas, levelPedasNama: levelObj.Nama_Level, variasiList, Subtotal: total, deskripsi });
    onClose();
  }

  const estimasi = [...selected].reduce((s, id) => {
    const v = variasiMenu.find(x => x.ID_Variasi === id);
    return s + (v ? v.Harga * porsi : 0);
  }, 0);

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col" style={{ borderTop: "6px solid #dc2626" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-red-600" />
            <h3 className="font-bold text-gray-800">Seblak Paket – Multi Topping</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Jumlah Porsi</label>
              <Input type="number" value={porsi} onChange={(v) => setPorsi(Math.max(1, Number(v)))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tingkat Pedas</label>
              <Select value={levelPedas} onChange={setLevelPedas}>
                {tingkatPedas.map(l => <option key={l.ID_Kepedasan} value={l.ID_Kepedasan}>{l.Nama_Level}</option>)}
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Pilih Variasi (bisa lebih dari satu)</label>
            <div className="flex flex-wrap gap-2">
              {seblakVars.map(v => (
                <button
                  key={v.ID_Variasi}
                  onClick={() => toggleVar(v.ID_Variasi)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selected.has(v.ID_Variasi)
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "bg-amber-50 text-amber-900 border-amber-200 hover:border-amber-400"
                  }`}
                >
                  {v.Nama_Variasi} · {rp(v.Harga)}
                </button>
              ))}
            </div>
          </div>

          {selected.size > 0 && (
            <div className="bg-amber-50 rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="text-xs text-amber-700 font-medium">{selected.size} variasi dipilih</span>
              <span className="font-bold text-red-700">{rp(estimasi)}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <Btn variant="ghost" onClick={onClose} className="flex-1">Batal</Btn>
          <Btn variant="success" onClick={handleAdd} disabled={selected.size === 0} className="flex-1">
            <Plus size={14} /> Tambah ke Keranjang
          </Btn>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ─── STRUK MODAL ─────────────────────────────────────────────────────────────

function StrukModalView({ data, onClose }: { data: StrukModal; onClose: () => void }) {
  const { struk, detailItems, nomorAntrian, namaPelanggan, layanan } = data;
  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" style={{ borderLeft: "8px solid #dc2626" }}>
        <div className="px-6 py-5 text-center border-b-2 border-dashed border-amber-300" style={{ fontFamily: "'Courier New', monospace", background: "#fffef7" }}>
          <div className="text-2xl font-black tracking-widest text-red-700">🍜 SEBLAK SOBA</div>
          <div className="text-xs text-gray-500 mt-0.5">Warung Pedas Mantap</div>
          <div className="text-xs text-gray-400 mt-1">{struk.Tanggal_Waktu}</div>
        </div>
        <div className="px-6 py-4 space-y-1.5 text-sm" style={{ fontFamily: "'Courier New', monospace", background: "#fffef7" }}>
          <div className="flex justify-between text-gray-600"><span>No. Struk</span><span>{struk.Nomor_Struk}</span></div>
          <div className="flex justify-between font-bold"><span>No. Antrian</span><span className="text-red-600 text-lg">{nomorAntrian}</span></div>
          <div className="flex justify-between text-gray-600"><span>Pelanggan</span><span>{namaPelanggan}</span></div>
          <div className="flex justify-between text-gray-600"><span>Layanan</span><span>{layanan === "Dine In" ? "🍽️ Makan di Tempat" : "🥡 Bawa Pulang"}</span></div>
          <div className="border-t border-dashed border-amber-200 my-2" />
          {detailItems.map((item, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="flex-1 pr-2">{item.NamaVariasi} x{item.Jumlah}{item.NamaPedas ? ` (${item.NamaPedas})` : ""}</span>
              <span>{rp(item.Subtotal)}</span>
            </div>
          ))}
          <div className="border-t border-amber-300 pt-2 space-y-1">
            <div className="flex justify-between font-black"><span>TOTAL</span><span className="text-red-600">{rp(struk.Total_Bayar)}</span></div>
            <div className="flex justify-between text-xs text-gray-500"><span>Metode</span><span>{struk.Metode_Bayar}</span></div>
            <div className="flex justify-between text-xs text-gray-500"><span>Kembalian</span><span>{rp(struk.Kembalian)}</span></div>
          </div>
          <div className="text-center text-xs text-gray-400 pt-2">— Terima kasih! —</div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t flex gap-2">
          <Btn variant="ghost" onClick={onClose} className="flex-1"><X size={14} /> Tutup</Btn>
          <Btn variant="primary" onClick={() => window.print()} className="flex-1"><Printer size={14} /> Cetak</Btn>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ─── KASIR TAB ─────────────────────────────────────────────────────────────────

function KasirTab({ pesananArr, setPesananArr, detailArr, setDetailArr, antrianArr, setAntrianArr, transaksiArr, setTransaksiArr, strukArr, setStrukArr }: {
  pesananArr: Pesanan[];
  setPesananArr: React.Dispatch<React.SetStateAction<Pesanan[]>>;
  detailArr: DetailPesanan[];
  setDetailArr: React.Dispatch<React.SetStateAction<DetailPesanan[]>>;
  antrianArr: Antrian[];
  setAntrianArr: React.Dispatch<React.SetStateAction<Antrian[]>>;
  transaksiArr: Transaksi[];
  setTransaksiArr: React.Dispatch<React.SetStateAction<Transaksi[]>>;
  strukArr: Struk[];
  setStrukArr: React.Dispatch<React.SetStateAction<Struk[]>>;
}) {
  const [namaPelanggan, setNamaPelanggan] = useState("");
  const [jenisLayanan, setJenisLayanan] = useState("Dine In");
  const [kategoriMenu, setKategoriMenu] = useState("MNU001");
  const [idVariasi, setIdVariasi] = useState("VAR001");
  const [jumlahItem, setJumlahItem] = useState(1);
  const [levelPedas, setLevelPedas] = useState("KPD002");
  const [keranjang, setKeranjang] = useState<CartEntry[]>([]);
  const [metodeBayar, setMetodeBayar] = useState("Tunai");
  const [jumlahBayar, setJumlahBayar] = useState("");
  const [checkoutMsg, setCheckoutMsg] = useState("");
  const [showPaket, setShowPaket] = useState(false);
  const [strukModal, setStrukModal] = useState<StrukModal | null>(null);

  const seblakVars = variasiMenu.filter(v => v.ID_Menu === "MNU001");
  const minumanVars = variasiMenu.filter(v => v.ID_Menu === "MNU002");
  const currentVars = kategoriMenu === "MNU001" ? seblakVars : minumanVars;
  const isSeblak = kategoriMenu === "MNU001";

  useEffect(() => {
    const firstVar = currentVars[0];
    if (firstVar) setIdVariasi(firstVar.ID_Variasi);
  }, [kategoriMenu]);

  const totalKeranjang = keranjang.reduce((s, i) => s + i.Subtotal, 0);

  function tambahSingle() {
    const variasi = variasiMenu.find(v => v.ID_Variasi === idVariasi)!;
    const levelObj = tingkatPedas.find(l => l.ID_Kepedasan === levelPedas)!;
    const subtotal = variasi.Harga * jumlahItem;
    setKeranjang(prev => [...prev, {
      isPackage: false, ID_Menu: kategoriMenu, ID_Variasi: idVariasi,
      NamaVariasi: variasi.Nama_Variasi, HargaSatuan: variasi.Harga, Jumlah: jumlahItem,
      ID_Kepedasan: isSeblak ? levelPedas : null,
      NamaPedas: isSeblak ? levelObj.Nama_Level : null,
      Subtotal: subtotal,
    }]);
  }

  function hapusItem(idx: number) {
    setKeranjang(prev => prev.filter((_, i) => i !== idx));
  }

  function checkout() {
    if (!namaPelanggan.trim()) { setCheckoutMsg("⚠️ Nama pelanggan wajib diisi!"); return; }
    if (keranjang.length === 0) { setCheckoutMsg("⚠️ Keranjang masih kosong!"); return; }
    const bayar = parseInt(jumlahBayar);
    if (isNaN(bayar) || bayar < totalKeranjang) {
      setCheckoutMsg(`⚠️ Jumlah bayar kurang! Total: ${rp(totalKeranjang)}`); return;
    }
    const kembalian = bayar - totalKeranjang;
    const { tanggal, waktu } = nowDateTime();

    const idPesanan = genId("PSN", pesananArr as any, "ID_Pesanan");
    const newPesanan: Pesanan = { ID_Pesanan: idPesanan, Tanggal: tanggal, Waktu: waktu, Nama_Pelanggan: namaPelanggan.trim(), Total_Harga: totalKeranjang, Layanan: jenisLayanan };

    let detailCounter = detailArr.length;
    const newDetails: DetailPesanan[] = [];
    const detailForStruk: { NamaVariasi: string; Jumlah: number; NamaPedas: string | null; Subtotal: number }[] = [];

    for (const item of keranjang) {
      if (item.isPackage) {
        for (const v of item.variasiList) {
          detailCounter++;
          newDetails.push({ ID_Detail: `DTL${detailCounter.toString().padStart(3, "0")}`, ID_Pesanan: idPesanan, ID_Menu: "MNU001", ID_Variasi: v.ID_Variasi, ID_Kepedasan: item.levelPedasId, Jumlah: item.porsi, Harga_Satuan: v.HargaSatuan, Subtotal: v.SubtotalItem });
        }
        detailForStruk.push({ NamaVariasi: item.deskripsi, Jumlah: 1, NamaPedas: null, Subtotal: item.Subtotal });
      } else {
        detailCounter++;
        newDetails.push({ ID_Detail: `DTL${detailCounter.toString().padStart(3, "0")}`, ID_Pesanan: idPesanan, ID_Menu: item.ID_Menu, ID_Variasi: item.ID_Variasi, ID_Kepedasan: item.ID_Kepedasan, Jumlah: item.Jumlah, Harga_Satuan: item.HargaSatuan, Subtotal: item.Subtotal });
        detailForStruk.push({ NamaVariasi: item.NamaVariasi, Jumlah: item.Jumlah, NamaPedas: item.NamaPedas, Subtotal: item.Subtotal });
      }
    }

    const idTrx = genId("TRX", transaksiArr as any, "ID_Transaksi");
    const tglWaktu = `${tanggal} ${waktu}`;
    const newTrx: Transaksi = { ID_Transaksi: idTrx, ID_Pesanan: idPesanan, Tanggal_Waktu: tglWaktu, Jumlah_Dibayar: bayar, Metode_Bayar: metodeBayar, Status: "Lunas", Kembalian: kembalian };

    let maxAnt = 0;
    antrianArr.forEach(a => { const n = parseInt(a.Nomor_Antrian.substring(1)); if (n > maxAnt) maxAnt = n; });
    const nomorBaru = `A${(maxAnt + 1).toString().padStart(2, "0")}`;
    const idAntrian = genId("ANT", antrianArr as any, "ID_Antrian");
    const newAntrian: Antrian = { ID_Antrian: idAntrian, ID_Pesanan: idPesanan, Nomor_Antrian: nomorBaru, Waktu_Masuk: waktu, Status_Antrian: "Menunggu", Waktu_Selesai: null };

    const nomorStruk = genId("STR", strukArr as any, "Nomor_Struk");
    const newStruk: Struk = { Nomor_Struk: nomorStruk, ID_Transaksi: idTrx, ID_Pesanan: idPesanan, Tanggal_Waktu: tglWaktu, Total_Bayar: totalKeranjang, Metode_Bayar: metodeBayar, Kembalian: kembalian };

    setPesananArr(p => [...p, newPesanan]);
    setDetailArr(d => [...d, ...newDetails]);
    setAntrianArr(a => [...a, newAntrian]);
    setTransaksiArr(t => [...t, newTrx]);
    setStrukArr(s => [...s, newStruk]);

    setKeranjang([]);
    setNamaPelanggan("");
    setJumlahBayar("");
    setCheckoutMsg(`✅ Pesanan berhasil! Antrian: ${nomorBaru} (${namaPelanggan.trim()})`);
    setTimeout(() => setCheckoutMsg(""), 4000);
    setStrukModal({ struk: newStruk, detailItems: detailForStruk, nomorAntrian: nomorBaru, namaPelanggan: namaPelanggan.trim(), layanan: jenisLayanan });
  }

  const recentPesanan = [...pesananArr].reverse().slice(0, 6);

  return (
    <div className="flex flex-col gap-5">
      {/* Form */}
      <Card>
        <CardHeader icon={<ShoppingCart size={16} />} title="Form Pesanan Baru" />
        <div className="p-6 flex flex-col gap-5">
          {/* Customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nama Pelanggan</label>
              <Input value={namaPelanggan} onChange={setNamaPelanggan} placeholder="Masukkan nama pelanggan..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Jenis Layanan</label>
              <Select value={jenisLayanan} onChange={setJenisLayanan}>
                <option value="Dine In">🍽️ Makan di Tempat</option>
                <option value="Take Away">🥡 Bawa Pulang</option>
              </Select>
            </div>
          </div>

          {/* Menu Picker */}
          <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-4">
            <p className="text-xs font-bold text-amber-800 mb-3 uppercase tracking-wide">Tambah Menu</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">Kategori</label>
                <Select value={kategoriMenu} onChange={setKategoriMenu}>
                  <option value="MNU001">🍲 Seblak Soba</option>
                  <option value="MNU002">🥤 Minuman</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">Variasi</label>
                <Select value={idVariasi} onChange={setIdVariasi}>
                  {currentVars.map(v => (
                    <option key={v.ID_Variasi} value={v.ID_Variasi}>{v.Nama_Variasi} — {rp(v.Harga)}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">
                  Tingkat Pedas {!isSeblak && <span className="text-gray-300">(n/a)</span>}
                </label>
                <Select value={levelPedas} onChange={setLevelPedas} className={!isSeblak ? "opacity-40 pointer-events-none" : ""}>
                  {tingkatPedas.map(l => <option key={l.ID_Kepedasan} value={l.ID_Kepedasan}>{l.Nama_Level}</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">Jumlah</label>
                <Input type="number" value={jumlahItem} onChange={(v) => setJumlahItem(Math.max(1, Number(v)))} />
              </div>
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <Btn variant="warning" onClick={tambahSingle}><Plus size={14} /> Tambah</Btn>
              <Btn variant="success" size="sm" onClick={() => setShowPaket(true)}>
                <Package size={13} /> Seblak Paket (Multi Topping)
              </Btn>
            </div>
          </div>

          {/* Cart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">🛒 Keranjang Belanja</span>
              <Badge color={keranjang.length > 0 ? "amber" : "gray"}>{keranjang.length} item</Badge>
            </div>
            {keranjang.length === 0 ? (
              <div className="text-center py-6 text-gray-300 text-sm rounded-xl border border-dashed border-gray-200 bg-gray-50">
                Belum ada item — tambahkan menu di atas
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-orange-100 divide-y divide-orange-50">
                {keranjang.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between px-4 py-3 bg-white hover:bg-amber-50/30 transition-colors">
                    <div className="flex-1">
                      {item.isPackage ? (
                        <p className="text-sm font-semibold text-gray-800">📦 Seblak Paket</p>
                      ) : (
                        <p className="text-sm font-semibold text-gray-800">{item.NamaVariasi}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.isPackage
                          ? `${item.variasiList.map(v => v.NamaVariasi).join(", ")} — ${item.levelPedasNama} · ${item.porsi} porsi`
                          : `x${item.Jumlah} · ${rp(item.HargaSatuan)}/pcs${item.NamaPedas ? ` · 🌶️ ${item.NamaPedas}` : ""}`
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="font-bold text-sm text-red-600">{rp(item.Subtotal)}</span>
                      <button onClick={() => hapusItem(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total & Checkout */}
          <div className="rounded-2xl bg-gradient-to-r from-red-50 to-amber-50 border border-orange-100 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Pesanan</span>
              <span className="text-2xl font-black text-red-600">{rp(totalKeranjang)}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">Metode Bayar</label>
                <Select value={metodeBayar} onChange={setMetodeBayar}>
                  <option value="Tunai">💵 Tunai</option>
                  <option value="Qris">📱 QRIS</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">Jumlah Dibayar</label>
                <Input type="number" value={jumlahBayar} onChange={setJumlahBayar} placeholder="0" />
              </div>
              <div className="flex items-end">
                <Btn variant="primary" onClick={checkout} className="w-full justify-center">
                  <CheckCircle size={15} /> Proses & Cetak Antrian
                </Btn>
              </div>
            </div>
            {checkoutMsg && (
              <div className={`rounded-xl px-4 py-2 text-sm font-medium ${checkoutMsg.startsWith("⚠️") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {checkoutMsg}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader icon={<BarChart2 size={16} />} title="Pesanan Terakhir / Aktif" right={<Badge color="red">{recentPesanan.length} pesanan</Badge>} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amber-50 border-b border-orange-100">
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">ID</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Pelanggan</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-center px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Waktu</th>
                <th className="text-center px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Layanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50">
              {recentPesanan.map(p => (
                <tr key={p.ID_Pesanan} className="hover:bg-amber-50/50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-gray-400">{p.ID_Pesanan}</td>
                  <td className="px-5 py-3 font-semibold text-gray-800">{p.Nama_Pelanggan}</td>
                  <td className="px-5 py-3 text-right font-bold text-red-600">{rp(p.Total_Harga)}</td>
                  <td className="px-5 py-3 text-center text-gray-500">{p.Waktu}</td>
                  <td className="px-5 py-3 text-center">
                    <Badge color={p.Layanan === "Dine In" ? "green" : "amber"}>
                      {p.Layanan === "Dine In" ? "🍽️ Dine In" : "🥡 Take Away"}
                    </Badge>
                  </td>
                </tr>
              ))}
              {recentPesanan.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-300 text-sm">Belum ada pesanan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showPaket && <PaketModal onClose={() => setShowPaket(false)} onAdd={(pkg) => setKeranjang(p => [...p, pkg])} />}
      {strukModal && <StrukModalView data={strukModal} onClose={() => setStrukModal(null)} />}
    </div>
  );
}

// ─── KOKI TAB ──────────────────────────────────────────────────────────────────

function KokiTab({ pesananArr, detailArr, antrianArr, setAntrianArr }: {
  pesananArr: Pesanan[];
  detailArr: DetailPesanan[];
  antrianArr: Antrian[];
  setAntrianArr: React.Dispatch<React.SetStateAction<Antrian[]>>;
}) {
  const [tick, setTick] = useState(0);
  const pending = antrianArr.filter(a => a.Status_Antrian !== "Selesai");

  function selesaikan(idAntrian: string) {
    const { waktu } = nowDateTime();
    setAntrianArr(prev => prev.map(a => a.ID_Antrian === idAntrian ? { ...a, Status_Antrian: "Selesai", Waktu_Selesai: waktu } : a));
    setTick(t => t + 1);
  }

  return (
    <Card>
      <CardHeader
        icon={<ChefHat size={16} />}
        title="Antrian Dapur – Status Masakan"
        right={
          <Btn variant="ghost" size="sm" onClick={() => setTick(t => t + 1)}>
            <RefreshCw size={13} /> Refresh
          </Btn>
        }
      />
      {pending.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-300">
          <CheckCircle size={40} className="mb-3 text-emerald-300" />
          <p className="font-semibold text-emerald-500">Semua pesanan sudah selesai! ✨</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amber-50 border-b border-orange-100">
                {["No. Antrian", "Pelanggan", "Detail Pesanan", "Status", "Aksi"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50">
              {pending.map(ant => {
                const pesanan = pesananArr.find(p => p.ID_Pesanan === ant.ID_Pesanan);
                const details = detailArr.filter(d => d.ID_Pesanan === ant.ID_Pesanan);
                const groupMap = new Map<string, { isPackage: boolean; items: { nama: string; jumlah: number }[]; levelPedasId: string | null; jumlahPorsi: number }>();
                for (const det of details) {
                  const variasi = variasiMenu.find(v => v.ID_Variasi === det.ID_Variasi);
                  if (!variasi) continue;
                  const key = det.ID_Menu === "MNU001" ? `seblak_${det.ID_Kepedasan}` : `minuman_${det.ID_Variasi}`;
                  if (!groupMap.has(key)) groupMap.set(key, { isPackage: det.ID_Menu === "MNU001", items: [], levelPedasId: det.ID_Kepedasan, jumlahPorsi: 0 });
                  const g = groupMap.get(key)!;
                  g.items.push({ nama: variasi.Nama_Variasi, jumlah: det.Jumlah });
                  g.jumlahPorsi = det.Jumlah;
                }
                const detailLines: string[] = [];
                for (const [, g] of groupMap) {
                  const lvlNama = g.levelPedasId ? (tingkatPedas.find(l => l.ID_Kepedasan === g.levelPedasId)?.Nama_Level ?? "") : "";
                  if (g.isPackage && g.items.length > 1) {
                    detailLines.push(`📦 Seblak Paket (${g.items.map(i => i.nama).join(", ")}) x${g.jumlahPorsi} — ${lvlNama}`);
                  } else {
                    g.items.forEach(i => detailLines.push(`• ${i.nama} x${i.jumlah}${lvlNama ? ` (${lvlNama})` : ""}`));
                  }
                }
                return (
                  <tr key={ant.ID_Antrian} className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="text-lg font-black text-red-600">{ant.Nomor_Antrian}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-800">{pesanan?.Nama_Pelanggan ?? "—"}</td>
                    <td className="px-5 py-4 text-xs text-gray-600 leading-relaxed">
                      {detailLines.map((l, i) => <div key={i}>{l}</div>)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge color="amber">⏳ {ant.Status_Antrian}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Btn variant="success" size="sm" onClick={() => selesaikan(ant.ID_Antrian)}>
                        <CheckCircle size={13} /> Selesai
                      </Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// ─── OWNER TAB ─────────────────────────────────────────────────────────────────

function OwnerTab({ pesananArr, detailArr, transaksiArr }: {
  pesananArr: Pesanan[];
  detailArr: DetailPesanan[];
  transaksiArr: Transaksi[];
}) {
  const today = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const [tanggal, setTanggal] = useState(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`);
  const [hasil, setHasil] = useState<{ total: number; rincian: { nama: string; jumlah: number; pendapatan: number }[] } | null>(null);
  const [noData, setNoData] = useState(false);

  function generate() {
    const [y, m, d] = tanggal.split("-");
    const target = `${d}/${m}/${y}`;
    const filtered = transaksiArr.filter(t => t.Tanggal_Waktu.startsWith(target));
    if (filtered.length === 0) { setHasil(null); setNoData(true); return; }
    setNoData(false);
    let total = 0;
    const mapVar = new Map<string, { nama: string; jumlah: number; pendapatan: number }>();
    for (const trx of filtered) {
      const p = pesananArr.find(x => x.ID_Pesanan === trx.ID_Pesanan);
      if (p) total += p.Total_Harga;
      const details = detailArr.filter(d => d.ID_Pesanan === trx.ID_Pesanan);
      for (const det of details) {
        const v = variasiMenu.find(x => x.ID_Variasi === det.ID_Variasi);
        if (!v) continue;
        if (!mapVar.has(det.ID_Variasi)) mapVar.set(det.ID_Variasi, { nama: v.Nama_Variasi, jumlah: 0, pendapatan: 0 });
        const data = mapVar.get(det.ID_Variasi)!;
        data.jumlah += det.Jumlah;
        data.pendapatan += det.Subtotal;
      }
    }
    setHasil({ total, rincian: [...mapVar.values()] });
  }

  function downloadCSV() {
    if (!hasil) return;
    const lines = [
      "LAPORAN PENJUALAN SEBLAK SOBA",
      `Tanggal,${tanggal}`,
      `Total Pendapatan,${hasil.total}`,
      "",
      "Menu Variasi,Jumlah Terjual,Pendapatan (Rp)",
      ...hasil.rincian.map(r => `${r.nama},${r.jumlah},${r.pendapatan}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `Laporan_${tanggal}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <CardHeader icon={<BarChart2 size={16} />} title="Laporan Keuangan & Penjualan" />
      <div className="p-6 flex flex-col gap-5">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pilih Tanggal Laporan</label>
            <Input type="date" value={tanggal} onChange={setTanggal} className="w-52" />
          </div>
          <Btn variant="primary" onClick={generate}><BarChart2 size={14} /> Tampilkan</Btn>
          <Btn variant="success" onClick={downloadCSV} disabled={!hasil}><Download size={14} /> Download CSV</Btn>
        </div>

        {noData && (
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-6 text-center text-gray-400 text-sm">
            📭 Tidak ada transaksi pada tanggal {tanggal.split("-").reverse().join("/")}
          </div>
        )}

        {hasil && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white p-5 shadow-lg shadow-red-200">
                <p className="text-xs font-semibold opacity-75 uppercase tracking-wide mb-1">Total Pendapatan</p>
                <p className="text-3xl font-black">{rp(hasil.total)}</p>
                <p className="text-xs opacity-60 mt-1">{tanggal.split("-").reverse().join("/")}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white p-5 shadow-lg shadow-amber-200">
                <p className="text-xs font-semibold opacity-75 uppercase tracking-wide mb-1">Variasi Terjual</p>
                <p className="text-3xl font-black">{hasil.rincian.length}</p>
                <p className="text-xs opacity-60 mt-1">jenis menu</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-orange-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-amber-50 border-b border-orange-100">
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Menu Variasi</th>
                    <th className="text-center px-5 py-3 text-xs font-bold text-gray-500 uppercase">Jumlah Terjual</th>
                    <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase">Pendapatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-50">
                  {hasil.rincian.map((r, i) => (
                    <tr key={i} className="hover:bg-amber-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">{r.nama}</td>
                      <td className="px-5 py-3 text-center">
                        <Badge color="amber">{r.jumlah} pcs</Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-red-600">{rp(r.pendapatan)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "kasir", label: "KASIR · Input Pesanan", icon: <ShoppingCart size={15} /> },
  { id: "koki", label: "KOKI · Antrian & Masak", icon: <ChefHat size={15} /> },
  { id: "owner", label: "OWNER · Laporan", icon: <BarChart2 size={15} /> },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("kasir");
  const [pesananArr, setPesananArr] = useState<Pesanan[]>(INIT_PESANAN);
  const [detailArr, setDetailArr] = useState<DetailPesanan[]>(INIT_DETAIL);
  const [antrianArr, setAntrianArr] = useState<Antrian[]>(INIT_ANTRIAN);
  const [transaksiArr, setTransaksiArr] = useState<Transaksi[]>(INIT_TRANSAKSI);
  const [strukArr, setStrukArr] = useState<Struk[]>(INIT_STRUK);

  const pendingCount = antrianArr.filter(a => a.Status_Antrian !== "Selesai").length;

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif", background: "linear-gradient(145deg, #fef3c7 0%, #fee2e2 50%, #fef9e7 100%)" }}>
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Header */}
        <div
          className="rounded-3xl overflow-hidden shadow-xl"
          style={{ background: "linear-gradient(135deg, #991b1b 0%, #b91c1c 50%, #dc2626 100%)", borderBottom: "5px solid #fbbf24" }}
        >
          <div className="px-6 py-6 text-center">
            <h1 className="text-3xl font-black tracking-widest text-amber-50" style={{ textShadow: "3px 3px 0 #7f1d1d" }}>
              🍜 SISTEM WARUNG SEBLAK SOBA 🔥
            </h1>
            <p className="text-amber-300 font-medium mt-1 text-sm">Pedasnya Nagih, Manajemennya Modern!</p>
          </div>
          <div className="bg-amber-50/10 px-6 py-2 text-center">
            <p className="text-amber-200 text-xs">
              Kelompok 1 ·{" "}
              {["Nadzral", "Gefira", "Chandra", "Dede Hidayat", "Raihan"].map(name => (
                <span key={name} className="inline-block mx-1 bg-white/20 text-white px-2 py-0.5 rounded-full text-xs font-medium">{name}</span>
              ))}
            </p>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-red-600 text-white shadow-lg shadow-red-200"
                  : "bg-white/80 text-gray-600 hover:bg-white hover:shadow-sm border border-orange-100"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "koki" && pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "kasir" && (
          <KasirTab
            pesananArr={pesananArr} setPesananArr={setPesananArr}
            detailArr={detailArr} setDetailArr={setDetailArr}
            antrianArr={antrianArr} setAntrianArr={setAntrianArr}
            transaksiArr={transaksiArr} setTransaksiArr={setTransaksiArr}
            strukArr={strukArr} setStrukArr={setStrukArr}
          />
        )}
        {activeTab === "koki" && (
          <KokiTab
            pesananArr={pesananArr} detailArr={detailArr}
            antrianArr={antrianArr} setAntrianArr={setAntrianArr}
          />
        )}
        {activeTab === "owner" && (
          <OwnerTab pesananArr={pesananArr} detailArr={detailArr} transaksiArr={transaksiArr} />
        )}
      </div>
    </div>
  );
}
