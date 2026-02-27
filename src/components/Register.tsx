import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import { User, MapPin, Phone, Edit3, Save, X } from 'lucide-react';

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

  // อัปเดตข้อมูลเมื่อมีข้อมูลเดิมส่งเข้ามา
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone);
      setAddress(initialData.address);
    }
  }, [initialData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onRegister(name, phone, address);
    setIsEditing(false); // เมื่อบันทึกเสร็จ ให้กลับไปโหมดดูข้อมูล
  };

  const handleCancel = () => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone);
      setAddress(initialData.address);
    }
    setIsEditing(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
            <User size={40} />
          </div>
          <h2 className="text-xl font-bold">{isRegistered ? 'ข้อมูลสมาชิก' : 'ลงทะเบียนใหม่'}</h2>
          <p className="text-blue-100 text-xs">ข้อมูลสำหรับใช้ในการจัดส่งและติดต่อ</p>
        </div>

        <div className="p-6">
          {isEditing ? (
            /* --- โหมดแก้ไขข้อมูล (Form) --- */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-600 text-xs font-bold mb-1 ml-1 uppercase">ชื่อ-นามสกุล / บริษัท</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full pl-3 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="ระบุชื่อของคุณ"
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 text-xs font-bold mb-1 ml-1 uppercase">เบอร์โทรศัพท์</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="08X-XXX-XXXX"
                  required 
                />
              </div>

              <div>
                <label className="block text-gray-600 text-xs font-bold mb-1 ml-1 uppercase">ที่อยู่จัดส่ง / สาขา</label>
                <textarea 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={4}
                  placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล..."
                  required 
                />
              </div>

              <div className="flex gap-2 pt-2">
                {isRegistered && (
                  <button 
                    type="button" 
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-600 p-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    <X size={18} /> ยกเลิก
                  </button>
                )}
                <button 
                  type="submit" 
                  className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                >
                  <Save size={18} /> บันทึกข้อมูล
                </button>
              </div>
            </form>
          ) : (
            /* --- โหมดโชว์ข้อมูล (Display) --- */
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-2">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><User size={20} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">ชื่อ-นามสกุล</p>
                  <p className="text-gray-800 font-medium text-lg">{name || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-2">
                <div className="bg-green-50 p-3 rounded-xl text-green-600"><Phone size={20} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">เบอร์โทรศัพท์</p>
                  <p className="text-gray-800 font-medium text-lg">{phone || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-2">
                <div className="bg-orange-50 p-3 rounded-xl text-orange-600"><MapPin size={20} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">ที่อยู่จัดส่ง</p>
                  <p className="text-gray-800 font-medium leading-relaxed">{address || '-'}</p>
                </div>
              </div>

              <button 
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center gap-2 mt-4 bg-white border-2 border-blue-600 text-blue-600 p-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
              >
                <Edit3 size={18} /> แก้ไขข้อมูลส่วนตัว
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;