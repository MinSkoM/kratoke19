import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import { User, MapPin, Phone, Edit3, Save, X, Trash2, ShieldCheck } from 'lucide-react';

interface RegisterProps {
  onRegister: (name: string, phone: string, address: string) => Promise<void>;
  initialData?: { name: string; phone: string; address: string } | null;
  isRegistered: boolean;
}

const Register: FC<RegisterProps> = ({ onRegister, initialData, isRegistered }) => {
  const [isEditing, setIsEditing] = useState(!isRegistered);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pdpaConsent, setPdpaConsent] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone);
      setAddress(initialData.address);
    }
  }, [initialData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pdpaConsent) return;
    await onRegister(name, phone, address);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone);
      setAddress(initialData.address);
    }
    setPdpaConsent(false);
    setIsEditing(false);
  };

  return (
    <div className="max-w-md mx-auto pb-24">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
            <User size={40} />
          </div>
          <h2 className="text-2xl font-bold">{isRegistered ? 'ข้อมูลสมาชิก' : 'ลงทะเบียนใหม่'}</h2>
          <p className="text-blue-100 text-sm mt-1">ข้อมูลสำหรับใช้ในการจัดส่งและติดต่อ</p>
        </div>

        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-600 text-sm font-bold mb-2">ชื่อ-นามสกุล / บริษัท</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-4 text-lg bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="ระบุชื่อของคุณ"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm font-bold mb-2">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-4 text-lg bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="08X-XXX-XXXX"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm font-bold mb-2">ที่อยู่จัดส่ง / สาขา</label>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-4 py-4 text-lg bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={4}
                  placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล..."
                  required
                />
              </div>

              {/* PDPA Consent */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={22} className="text-blue-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-blue-800 mb-1">นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)</p>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      ร้านเราจะเก็บข้อมูลของคุณ (ชื่อ, เบอร์โทรศัพท์, ที่อยู่) เพื่อวัตถุประสงค์ในการ
                      สั่งซื้อและจัดส่งสินค้าเท่านั้น จะไม่นำไปใช้เพื่อวัตถุประสงค์อื่น
                    </p>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pdpaConsent}
                        onChange={e => setPdpaConsent(e.target.checked)}
                        className="w-5 h-5 rounded accent-blue-600"
                        required
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        ฉันยินยอมให้เก็บและใช้ข้อมูลส่วนตัว
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                {isRegistered && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-4 rounded-2xl text-base font-bold hover:bg-gray-200 transition-colors"
                  >
                    <X size={18} /> ยกเลิก
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!pdpaConsent}
                  className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl text-base font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-md"
                >
                  <Save size={18} /> บันทึกข้อมูล
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start gap-4 p-2">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600 shrink-0"><User size={22} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">ชื่อ-นามสกุล</p>
                  <p className="text-gray-800 font-semibold text-xl">{name || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-2">
                <div className="bg-green-50 p-3 rounded-xl text-green-600 shrink-0"><Phone size={22} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">เบอร์โทรศัพท์</p>
                  <p className="text-gray-800 font-semibold text-xl">{phone || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-2">
                <div className="bg-orange-50 p-3 rounded-xl text-orange-600 shrink-0"><MapPin size={22} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">ที่อยู่จัดส่ง</p>
                  <p className="text-gray-800 font-medium text-lg leading-relaxed">{address || '-'}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => { setPdpaConsent(false); setIsEditing(true); }}
                  className="w-full flex items-center justify-center gap-2 bg-white border-2 border-blue-600 text-blue-600 py-4 rounded-2xl text-base font-bold hover:bg-blue-50 transition-colors"
                >
                  <Edit3 size={18} /> แก้ไขข้อมูลส่วนตัว
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-200 text-red-500 py-4 rounded-2xl text-base font-bold hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} /> ขอลบข้อมูลของฉัน
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Request Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">ขอลบข้อมูล</h3>
            <p className="text-base text-gray-600 text-center leading-relaxed mb-5">
              คุณมีสิทธิ์ขอลบข้อมูลส่วนตัวของคุณออกจากระบบได้ตามกฎหมาย PDPA
              กรุณาแจ้งทางร้านผ่านทาง LINE เพื่อดำเนินการ
            </p>
            <div className="bg-gray-50 rounded-xl p-4 text-center mb-5">
              <p className="text-sm text-gray-500 mb-1">แจ้งผ่านช่องทาง</p>
              <p className="text-lg font-bold text-blue-600">LINE Official Account ของร้าน</p>
              <p className="text-sm text-gray-500 mt-1">พิมพ์ว่า "ขอลบข้อมูล" พร้อมชื่อของคุณ</p>
            </div>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="w-full py-4 bg-gray-100 text-gray-700 font-bold text-base rounded-xl hover:bg-gray-200 transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
