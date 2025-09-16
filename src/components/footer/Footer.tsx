export default function Footer() {
  return (
    <footer className="bg-topbar2 text-gray-200 mt-12">
      <div className="container-px py-8 grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div>
          <div className="font-semibold mb-2">Get to Know Us</div>
          <div className="space-y-1">
            <div>About</div><div>Careers</div><div>Press</div>
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Connect</div>
          <div className="space-y-1">
            <div>Facebook</div><div>Twitter</div><div>Instagram</div>
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Make Money</div>
          <div className="space-y-1">
            <div>Sell</div><div>Affiliate</div><div>Advertise</div>
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Help</div>
          <div className="space-y-1">
            <div>Payments</div><div>Shipping</div><div>Returns</div>
          </div>
        </div>
      </div>
      <div className="text-center text-xs py-3 bg-topbar">© {new Date().getFullYear()} Amazon-like Demo</div>
    </footer>
  );
}
