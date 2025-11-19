export default function Footer() {
  return (
    <footer className="bg-orange-600 text-white py-8 mt-20">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">

        <h2 className="text-2xl font-bold">PeanutButter.</h2>

        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="/" className="hover:underline">Home</a>
          <a href="/products" className="hover:underline">Products</a>
          <a href="/cart" className="hover:underline">Shop</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>

        <p className="mt-4 md:mt-0 text-sm">
          © {new Date().getFullYear()} PeanutButter Store — All rights reserved.
        </p>

      </div>
    </footer>
  );
}
