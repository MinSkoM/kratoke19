import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import { User, MapPin, Phone, Edit3, Save, X, Trash2, ShieldCheck } from 'lucide-react';

interface RegisterProps {
  onRegister: (name: string, phone: string, address: string) => Promise<void>;
  initialData?: { name: string; phone: string; address: string } | null;
  isRegistered: boolean;
}

const Register: FC<RegisterProps> = ({ onRegister, initialData, isRegistered }) => {
  const [isEditing,      setIsEditing]      = useState(!isRegistered);
  const [name,           setName]           = useState('');
  const [phone,          setPhone]          = useState('');
  const [address,        setAddress]        = useState('');
  const [pdpaConsent,    setPdpaConsent]    = useState(false);
  const [showDeleteModal,setShowDeleteModal]= useState(false);

  useEffect(() => {
    if (initialData) { setName(initialData.name); setPhone(initialData.phone); setAddress(initialData.address); }
  }, [initialData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pdpaConsent) return;
    await onRegister(name, phone, address);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (initialData) { setName(initialData.name); setPhone(initialData.phone); setAddress(initialData.address); }
    setPdpaConsent(false);
    setIsEditing(false);
  };

  return (
    <div className="max-w-md mx-auto pb-28">

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Header banner */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 px-6 pt-8 pb-8 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 ring-4 ring-white/30">
            <User size={38}/>
          </div>
          <h2 className="text-2xl font-black">{isRegistered ? 'ข้อมูลของฉัน' : 'ลงทะเบียนใหม่'}</h2>
          <p className="text-blue-200 text-sm mt-1">ข้อมูลสำหรับจัดส่งและติดต่อ</p>
        </div>

        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">

              <Field label="ชื่อ-นามสกุล / บริษัท" icon="👤">
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="input-field" placeholder="ระบุชื่อของคุณ" required/>
              </Field>

              <Field label="เบอร์โทรศัพท์" icon="📞">
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  className="input-field" placeholder="08X-XXX-XXXX" required/>
              </Field>

              <Field label="ที่อยู่จัดส่ง / สาขา" icon="📍">
                <textarea value={address} onChange={e => setAddress(e.target.value)}
                  className="input-field resize-none" rows={4}
                  placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล..." required/>
              </Field>

              {/* PDPA */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <div className="flex gap-3 items-start">
                  <ShieldCheck size={20} className="text-blue-500 mt-0.5 shrink-0"/>
                  <div>
                    <p className="text-sm font-bold text-blue-800 mb-1">นโยบายคุ้มครองข้อมูลส่วนบุคคล</p>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      ร้านจะเก็บชื่อ, เบอร์โทร, ที่อยู่ เพื่อการสั่งซื้อและจัดส่งเท่านั้น ไม่นำไปใช้เพื่อวัตถุประสงค์อื่น
                    </p>
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input type="checkbox" checked={pdpaConsent} onChange={e => setPdpaConsent(e.target.checked)}
                        className="w-5 h-5 rounded accent-blue-600"/>
                      <span className="text-sm font-semibold text-gray-800">ฉันยินยอมให้เก็บและใช้ข้อมูลส่วนตัว</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                {isRegistered && (
                  <button type="button" onClick={handleCancel}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold text-base">
                    <X size={18}/> ยกเลิก
                  </button>
                )}
                <button type="submit" disabled={!pdpaConsent}
                  className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-bold text-base shadow-md active:scale-95 transition-transform disabled:bg-gray-300 disabled:text-gray-500 disabled:scale-100">
                  <Save size={18}/> บันทึกข้อมูล
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-1">

              <InfoRow icon={<User size={20} className="text-blue-500"/>} iconBg="bg-blue-50" label="ชื่อ-นามสกุล" value={name}/>
              <InfoRow icon={<Phone size={20} className="text-green-500"/>} iconBg="bg-green-50" label="เบอร์โทรศัพท์" value={phone}/>
              <InfoRow icon={<MapPin size={20} className="text-orange-500"/>} iconBg="bg-orange-50" label="ที่อยู่จัดส่ง" value={address}/>

              <div className="pt-4 space-y-3">
                <button onClick={() => { setPdpaConsent(false); setIsEditing(true); }}
                  className="w-full flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 py-4 rounded-2xl font-bold text-base hover:bg-blue-50 transition-colors">
                  <Edit3 size={18}/> แก้ไขข้อมูล
                </button>
                <button onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-center gap-2 border-2 border-red-200 text-red-400 py-3.5 rounded-2xl font-bold text-sm hover:bg-red-50 transition-colors">
                  <Trash2 size={16}/> ขอลบข้อมูลของฉัน
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-5 backdrop-blur-sm"
          onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-xs text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={26} className="text-red-500"/>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ขอลบข้อมูล</h3>
            <p className="text-base text-gray-500 leading-relaxed mb-5">
              คุณมีสิทธิ์ขอลบข้อมูลส่วนตัวตามกฎหมาย PDPA
              กรุณาแจ้งร้านผ่านทาง LINE
            </p>
            <div className="bg-gray-50 rounded-2xl p-4 mb-5">
              <p className="text-sm text-gray-400 mb-1">แจ้งผ่าน</p>
              <p className="text-lg font-black text-blue-600">LINE OA ของร้าน</p>
              <p className="text-sm text-gray-500 mt-1">พิมพ์ว่า "ขอลบข้อมูล"</p>
            </div>
            <button onClick={() => setShowDeleteModal(false)}
              className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-2xl text-base">
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Field: FC<{ label: string; icon: string; children: React.ReactNode }> = ({ label, icon, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-sm font-bold text-gray-600 mb-1.5">
      <span>{icon}</span> {label}
    </label>
    {children}
  </div>
);

const InfoRow: FC<{ icon: React.ReactNode; iconBg: string; label: string; value: string }> = ({ icon, iconBg, label, value }) => (
  <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
    <div className={`${iconBg} p-3 rounded-xl shrink-0`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-gray-900 font-semibold text-lg leading-snug">{value || '—'}</p>
    </div>
  </div>
);

export default Register;
