
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { User, Lock } from "lucide-react";
import PhysicsBackground from "@/components/PhysicsBackground";
import { PhoneContact } from "@/components/PhoneContact";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState<"" | "student" | "parent" | "admin">("");
  const [loginError, setLoginError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
      return;
    }
    
    const userLoggedIn = localStorage.getItem("userLoggedIn");
    const storedUser = localStorage.getItem("currentUser");
    
    if (userLoggedIn === "true" && storedUser) {
      try {
        const savedUser = JSON.parse(storedUser);
        if (savedUser && savedUser.role) {
          setIsLoggingIn(true);
          login(savedUser.phone || savedUser.id, savedUser.password || "")
            .then(success => {
              if (success) {
                const audio = new Audio("/login-success.mp3");
                audio.volume = 0.5;
                audio.play().catch(e => console.error("Sound play failed:", e));
                
                navigate("/dashboard");
              }
            })
            .finally(() => setIsLoggingIn(false));
          return;
        }
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("userLoggedIn");
        localStorage.removeItem("currentUser");
      }
    }
    
    const savedLoginType = localStorage.getItem("loginType");
    const savedPhone = localStorage.getItem("userPhone");
    
    if (savedLoginType) {
      setLoginType(savedLoginType as "" | "student" | "parent" | "admin");
      setPhone(savedPhone || "");
    }
  }, [currentUser, navigate, login]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const audio = new Audio("/notification-sound.mp3");
          audio.volume = 0.5;
          audio.play().catch(e => console.error("Sound play failed:", e));
          
          toast({
            title: "تم تفعيل الإشعارات",
            description: "سوف تتلقى تنبيهات مهمة من التطبيق",
            variant: "default"
          });
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    
    try {
      if (loginType === "admin" && !phone.startsWith("AdminAPP")) {
        setLoginError("اسم المستخدم غير صحيح لحساب المسؤول");
        return;
      } else if (loginType === "student" && phone.startsWith("AdminAPP")) {
        setLoginError("رقم الهاتف غير صحيح لحساب الطالب");
        return;
      } else if (loginType === "parent" && phone.startsWith("AdminAPP")) {
        setLoginError("رقم الهاتف غير صحيح لحساب ولي الأمر");
        return;
      }
      
      const success = await login(phone, password);
      
      if (success) {
        await requestNotificationPermission();
        
        localStorage.setItem("userLoggedIn", "true");
        
        if (rememberMe) {
          localStorage.setItem("loginType", loginType);
          localStorage.setItem("userPhone", phone);
        } else {
          localStorage.removeItem("loginType");
          localStorage.removeItem("userPhone");
          localStorage.removeItem("userPassword");
        }
        
        const audio = new Audio("/login-success.mp3");
        audio.volume = 0.5;
        audio.play().catch(e => console.error("Sound play failed:", e));
        
        navigate("/dashboard");
      } else {
        const audio = new Audio("/error-sound.mp3");
        audio.volume = 0.3;
        audio.play().catch(e => console.error("Sound play failed:", e));
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("حدث خطأ أثناء تسجيل الدخول");
      
      const audio = new Audio("/error-sound.mp3");
      audio.volume = 0.3;
      audio.play().catch(e => console.error("Sound play failed:", e));
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <PhysicsBackground />
      <PhoneContact />
      
      {loginType === "" ? (
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Logo />
              <h1 className="text-2xl font-bold text-physics-gold mb-2 font-tajawal">تسجيل الدخول</h1>
              <p className="text-white opacity-80 font-tajawal">يرجى اختيار نوع الحساب</p>
            </div>

            <div className="space-y-4">
              <button
                className="goldBtn w-full shadow-lg font-tajawal"
                onClick={() => setLoginType("admin")}
                disabled={isLoggingIn}
              >
                دخول المسؤول
              </button>

              <button
                className="goldBtn w-full shadow-lg font-tajawal"
                onClick={() => setLoginType("student")}
                disabled={isLoggingIn}
              >
                دخول الطالب
              </button>

              <button
                className="goldBtn w-full shadow-lg font-tajawal"
                onClick={() => setLoginType("parent")}
                disabled={isLoggingIn}
              >
                دخول ولي الأمر
              </button>

              <div className="text-center mt-6">
                <button 
                  onClick={() => navigate("/")}
                  className="text-physics-gold hover:underline font-tajawal"
                  disabled={isLoggingIn}
                >
                  العودة للصفحة الرئيسية
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <Logo />
              <h1 className="text-2xl font-bold text-physics-gold mb-2 font-tajawal">
                {loginType === "admin" ? "دخول المسؤول" : loginType === "student" ? "دخول الطالب" : "دخول ولي الأمر"}
              </h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
                <input
                  type="text"
                  className="inputField pr-12 rounded-3xl font-tajawal"
                  placeholder={loginType === "admin" ? "اسم المستخدم" : "رقم الهاتف"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={isLoggingIn}
                />
              </div>

              <div className="relative">
                <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
                <input
                  type="password"
                  className="inputField pr-12 rounded-3xl font-tajawal"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoggingIn}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-me"
                  className="w-4 h-4 accent-physics-gold"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoggingIn}
                />
                <label htmlFor="remember-me" className="mr-2 text-white font-tajawal">
                  تذكرني
                </label>
              </div>

              {loginError && (
                <div className="bg-red-500 text-white p-3 rounded-lg text-center font-tajawal">
                  {loginError}
                </div>
              )}

              <button 
                type="submit" 
                className="goldBtn w-full shadow-lg font-tajawal"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    جاري تسجيل الدخول...
                  </div> 
                : "تسجيل الدخول"}
              </button>
              
              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => { 
                    setLoginType("");
                    setLoginError("");
                    setPhone("");
                    setPassword(""); 
                  }}
                  className="text-physics-gold hover:underline font-tajawal"
                  disabled={isLoggingIn}
                >
                  العودة لاختيار نوع الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
