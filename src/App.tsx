import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, History as HistoryIcon, Search, ShoppingCart, User, X } from 'lucide-react';
import AppProviders from './app/providers/AppProviders';
import AppRoutes from './app/routes/AppRoutes';
import { useShopApp } from './app/useShopApp';
import CartSummary from './features/cart/components/CartSummary';

const AppShell: FC = () => {
  const app = useShopApp();

  return (
    <div className="font-sans bg-[#F5F7FF] min-h-screen pb-24 overflow-x-hidden">
      {app.isLoading && (
        <div className="fixed inset-0 bg-white/95 z-[60] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#6A9DF7]/30 border-t-[#142D95] rounded-full animate-spin" />
            <p className="text-base font-semibold text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
      )}

      {app.showRegPrompt && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-5" onClick={() => app.setShowRegPrompt(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-xs text-center" onClick={event => event.stopPropagation()}>
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">กรุณาลงทะเบียนก่อนสั่งซื้อ</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">กรุณากรอกข้อมูลในหน้า "ข้อมูลฉัน" ก่อนเพิ่มสินค้าลงตะกร้าครับ</p>
            <div className="flex gap-3">
              <button
                onClick={() => app.setShowRegPrompt(false)}
                className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl text-base"
              >
                ปิด
              </button>
              <Link
                to="/register"
                onClick={() => app.setShowRegPrompt(false)}
                className="flex-[2] py-4 bg-[#142D95] text-white font-black rounded-2xl text-base shadow-sm active:scale-95 transition-transform"
              >
                ลงทะเบียน
              </Link>
            </div>
          </div>
        </div>
      )}

      <header className="bg-[#142D95] sticky top-0 z-40 shadow-md">
        <div className="max-w-md mx-auto flex items-center px-4 py-3 gap-3">
          {app.isPublicCalculator ? (
            <>
              <div className="w-9 h-9 rounded-xl bg-[#FCEF74] flex items-center justify-center shrink-0">
                <Calculator size={19} className="text-[#142D95]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-black text-white truncate leading-tight">เครื่องคำนวณราคา</p>
                <p className="text-xs font-semibold text-[#FCEF74] leading-tight">KRATOKE STEEL SHOP</p>
              </div>
            </>
          ) : (
            <>
              <div className="relative shrink-0">
                {app.userProfile?.pictureUrl
                  ? <img src={app.userProfile.pictureUrl} alt="avatar" className="w-9 h-9 rounded-full ring-2 ring-[#FCEF74]/60" />
                  : <div className="w-9 h-9 rounded-full bg-[#6A9DF7]/30 flex items-center justify-center"><User size={18} className="text-[#FCEF74]" /></div>}
                {app.isRegistered && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#142D95]" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate leading-tight">{app.userProfile?.displayName || 'กำลังโหลด...'}</p>
                <p className={`text-xs font-medium leading-tight ${app.isRegistered ? 'text-green-400' : 'text-[#FCEF74]'}`}>
                  {app.isRegistered ? 'สมาชิกยืนยันแล้ว' : 'ยังไม่ได้ลงทะเบียน'}
                </p>
              </div>
            </>
          )}

          <span className="text-sm font-black text-[#FCEF74] tracking-widest">KRATOKE</span>

          {!app.isPublicCalculator && (
            <button
              onClick={() => app.setShowCart(true)}
              className="relative w-10 h-10 bg-[#FCEF74] rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-transform shrink-0"
            >
              <ShoppingCart size={20} className="text-[#142D95]" />
              {app.totalQty > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#142D95] text-[#FCEF74] text-[11px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow">
                  {app.totalQty}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 min-h-[70vh]">
        {app.isLiffReady && app.isActive('/menu') && (
          <div className="relative mb-4">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหาสินค้า หรือ รหัส..."
              className="w-full pl-11 pr-11 py-3.5 text-base bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6A9DF7] focus:border-transparent placeholder:text-gray-300 transition-all"
              value={app.searchTerm}
              onChange={event => app.setSearchTerm(event.target.value)}
            />
            {app.searchTerm && (
              <button
                onClick={() => app.setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={14} className="text-gray-500" />
              </button>
            )}
          </div>
        )}

        {app.isLiffReady && (
          <AppRoutes
            products={app.products}
            orders={app.orders}
            isLoading={app.isLoading}
            searchTerm={app.searchTerm}
            filteredProducts={app.filteredProducts}
            groupedSearch={app.groupedSearch}
            expandedSearchName={app.expandedSearchName}
            setExpandedSearchName={app.setExpandedSearchName}
            addToCart={app.addToCart}
            handleRegister={app.handleRegister}
            isRegistered={app.isRegistered}
            memberInfo={app.memberInfo}
          />
        )}
      </main>

      {app.showCart && !app.isPublicCalculator && (
        <CartSummary
          cart={app.cart}
          cartTotal={app.cartTotal}
          deliveryMethod={app.deliveryMethod}
          setDeliveryMethod={app.setDeliveryMethod}
          setShowCart={app.setShowCart}
          isRegistered={app.isRegistered}
          handleCheckout={app.handleCheckout}
          userAddress={app.memberInfo?.address}
          updateQuantity={app.updateQuantity}
          onAddressUpdate={app.handleAddressUpdate}
        />
      )}

      {app.isLiffReady && !app.isPublicCalculator && (
        <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
          <div className="max-w-md mx-auto px-4 pb-3">
            <nav className="bg-[#142D95] rounded-3xl shadow-lg flex items-center px-2 py-2">
              {[
                { to: '/menu', icon: ShoppingCart, label: 'สั่งสินค้า', onClick: () => app.setSearchTerm('') },
                { to: '/history', icon: HistoryIcon, label: 'ประวัติ', onClick: undefined },
                { to: '/register', icon: User, label: 'ข้อมูลฉัน', onClick: undefined },
              ].map(({ to, icon: Icon, label, onClick }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={onClick}
                  className={`flex flex-col items-center justify-center flex-1 py-2 rounded-2xl gap-1 transition-all ${
                    app.isActive(to)
                      ? 'bg-[#FCEF74] text-[#142D95] shadow-sm'
                      : 'text-[#6A9DF7] hover:text-white'
                  }`}
                >
                  <Icon size={21} />
                  <span className="text-[11px] font-bold">{label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

const App: FC = () => (
  <AppProviders>
    <AppShell />
  </AppProviders>
);

export default App;
