import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { PhoneContact } from "@/components/PhoneContact";
import { ArrowRight, FilePlus, Calendar, Search, Play, Edit, Trash, X, Check, UserX } from "lucide-react";
import { VideoPlayerFixed } from "@/components/VideoPlayerFixed";
import { VideoUploader } from "@/components/VideoUploader";
import YouTubePlayerSimple from "@/components/YouTubePlayerSimple";
import { PlyrYouTubePlayer } from "@/components/PlyrYouTubePlayer";
import { StudentBlockingModal } from "@/components/StudentBlockingModal";

const Videos = () => {
  const navigate = useNavigate();
  const {
    getAllVideos,
    getVideosByGrade,
    addVideo,
    deleteVideo,
    updateVideo
  } = useData();
  
  const { currentUser, getAllStudents } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<"all" | "first" | "second" | "third">("all");
  const [selectedVideoIsYouTube, setSelectedVideoIsYouTube] = useState(false);

  // حالة النموذج
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [grade, setGrade] = useState<"first" | "second" | "third">("first");
  const [showUploader, setShowUploader] = useState(false);
  const [useYouTube, setUseYouTube] = useState(false);
  const [videoPassword, setVideoPassword] = useState("");
  const [blockedStudents, setBlockedStudents] = useState<string[]>([]);
  const [showBlockingModal, setShowBlockingModal] = useState(false);

  // حالة التعديل
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editGrade, setEditGrade] = useState<"first" | "second" | "third">("first");
  const [editIsYouTube, setEditIsYouTube] = useState(false);
  const [editVideoPassword, setEditVideoPassword] = useState("");
  const [editBlockedStudents, setEditBlockedStudents] = useState<string[]>([]);
  const [showEditBlockingModal, setShowEditBlockingModal] = useState(false);
  
  // فلترة الفيديوهات حسب دور المستخدم
  const getFilteredVideos = () => {
    if (currentUser?.role === "admin") {
      // المدير يرى جميع الفيديوهات مع إمكانية الفلترة
      return selectedGrade === "all" ? getAllVideos() : getVideosByGrade(selectedGrade);
    } else if (currentUser?.role === "student") {
      // الطالب يرى فقط فيديوهات صفه
      return getVideosByGrade(currentUser.grade!);
    } else if (currentUser?.role === "parent") {
      // ولي الأمر يرى فيديوهات صف ابنه
      // نحتاج للحصول على صف الطالب من خلال childrenIds
      const childId = currentUser.childrenIds?.[0];
      if (childId) {
        const students = getAllStudents();
        const child = students.find(s => s.id === childId);
        if (child) {
          return getVideosByGrade(child.grade);
        }
      }
      return [];
    }
    return [];
  };

  const videos = getFilteredVideos();
  const filteredVideos = videos.filter(video => video.title.toLowerCase().includes(searchQuery.toLowerCase()));
  
  // وظيفة تحسين وإصلاح روابط اليوتيوب
  const improveYouTubeUrl = (inputUrl: string): string => {
    let improved = inputUrl.trim();

    // إذا كان معرف الفيديو فقط (11 حرف)
    if (/^[a-zA-Z0-9_-]{11}$/.test(improved)) {
      return `https://www.youtube.com/watch?v=${improved}`;
    }

    // إضافة https:// إذا كان مفقود
    if (!improved.startsWith('http://') && !improved.startsWith('https://')) {
      improved = 'https://' + improved;
    }

    // تصحيح www.youtube إلى youtube
    improved = improved.replace(/www\.youtube/g, 'www.youtube');

    // تصحيح youtube إلى youtube.com
    if (improved.includes('youtube') && !improved.includes('youtube.com')) {
      improved = improved.replace(/youtube(?!\.com)/g, 'youtube.com');
    }

    // إضافة www إذا كان مفقود
    if (improved.includes('youtube.com') && !improved.includes('www.youtube.com')) {
      improved = improved.replace('youtube.com', 'www.youtube.com');
    }

    // تصحيح روابط youtu.be
    if (improved.includes('youtu.be/')) {
      const match = improved.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      if (match) {
        return `https://www.youtube.com/watch?v=${match[1]}`;
      }
    }

    // تصحيح روابط Shorts
    if (improved.includes('/shorts/')) {
      const match = improved.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (match) {
        return `https://www.youtube.com/watch?v=${match[1]}`;
      }
    }

    // تصحيح روابط Embed
    if (improved.includes('/embed/')) {
      const match = improved.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (match) {
        return `https://www.youtube.com/watch?v=${match[1]}`;
      }
    }

    // إزالة المعاملات غير الضرورية والاحتفاظ بـ v فقط
    if (improved.includes('youtube.com/watch')) {
      try {
        const urlObj = new URL(improved);
        const videoId = urlObj.searchParams.get('v');
        if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
          return `https://www.youtube.com/watch?v=${videoId}`;
        }
      } catch (e) {
        // إذا فشل parsing، نحاول استخراج معرف الفيديو يدوياً
        const match = improved.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        if (match) {
          return `https://www.youtube.com/watch?v=${match[1]}`;
        }
      }
    }

    return improved;
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      const audio = new Audio("/error-sound.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Sound play failed:", e));
      return;
    }

    // تحسين رابط اليوتيوب قبل الحفظ
    const finalUrl = useYouTube ? improveYouTubeUrl(url) : url;

    addVideo(title, finalUrl, grade, useYouTube, videoPassword || undefined, blockedStudents);
    setTitle("");
    setUrl("");
    setGrade("first");
    setVideoPassword("");
    setBlockedStudents([]);
    setShowAddForm(false);
    setShowUploader(false);
    setUseYouTube(false);
  };
  
  const handleVideoURLGenerated = (generatedUrl: string) => {
    setUrl(generatedUrl);
  };
  
  const handleEditVideo = (e: React.FormEvent) => {
    e.preventDefault();
    updateVideo(editId, editTitle, editUrl, editGrade, editIsYouTube, editVideoPassword || undefined, editBlockedStudents);
    setShowEditForm(false);
  };
  
  const handleDeleteVideo = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الفيديو؟")) {
      deleteVideo(id);
      if (selectedVideo) {
        setSelectedVideo(null);
      }
    }
  };
  
  const openEditForm = (video: any) => {
    setEditId(video.id);
    setEditTitle(video.title);
    setEditUrl(video.url);
    setEditGrade(video.grade);
    setEditIsYouTube(video.isYouTube || false);
    setEditVideoPassword(video.password || "");
    setEditBlockedStudents(video.blockedStudents || []);
    setShowEditForm(true);
  };
  
  const handleSelectVideo = (video: any) => {
    setSelectedVideo(video.url);
    setSelectedVideoIsYouTube(video.isYouTube || false);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return <div className="min-h-screen bg-physics-navy flex flex-col relative">
      <PhoneContact />
      
      {/* Header */}
      <header className="bg-physics-dark py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-physics-gold hover:opacity-80">
            <ArrowRight size={20} />
            <span>العودة للرئيسية</span>
          </button>
        </div>
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-physics-gold mb-2">الفيديوهات التعليمية</h1>
              <p className="text-gray-400 text-sm">مكتبة شاملة من الفيديوهات التعليمية لجميع المراحل</p>
            </div>
            {currentUser?.role === "admin" && <button onClick={() => setShowAddForm(true)} className="goldBtn flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3">
                <FilePlus size={18} />
                <span>إضافة فيديو جديد</span>
              </button>}
          </div>

          {/* التصفية والبحث */}
          <div className="bg-physics-dark rounded-lg p-4 sm:p-6 mb-6 border border-physics-gold/20">
            <div className="flex flex-col md:flex-row gap-4">
              {/* فلتر الصفوف - يظهر للمدير فقط */}
              {currentUser?.role === "admin" && (
                <div className="w-full md:w-1/3">
                  <label className="block text-white text-sm font-medium mb-2">تصفية حسب الصف</label>
                  <select className="inputField" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value as "all" | "first" | "second" | "third")}>
                    <option value="all">جميع الصفوف</option>
                    <option value="first">الصف الأول الثانوي</option>
                    <option value="second">الصف الثاني الثانوي</option>
                    <option value="third">الصف الثالث الثانوي</option>
                  </select>
                </div>
              )}

              <div className={`relative w-full ${currentUser?.role === "admin" ? "md:w-2/3" : ""}`}>
                <label className="block text-white text-sm font-medium mb-2">البحث في الفيديوهات</label>
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
                <input type="text" className="inputField pr-12" placeholder="ابحث عن فيديو بالعنوان..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            </div>

            {/* إحصائيات سريعة ورسائل توضيحية */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <span>📊</span>
                <span>إجمالي الفيديوهات: {videos.length}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span>🔍</span>
                <span>نتائج البحث: {filteredVideos.length}</span>
              </div>

              {/* رسالة للطلاب وأولياء الأمور */}
              {currentUser?.role === "student" && (
                <div className="flex items-center gap-2 text-physics-gold">
                  <span>🎯</span>
                  <span>
                    تعرض فيديوهات {currentUser.grade === "first" ? "الصف الأول" :
                                   currentUser.grade === "second" ? "الصف الثاني" : "الصف الثالث"} الثانوي فقط
                  </span>
                </div>
              )}

              {currentUser?.role === "parent" && (
                <div className="flex items-center gap-2 text-physics-gold">
                  <span>👨‍👩‍👧‍👦</span>
                  <span>تعرض فيديوهات صف ابنك فقط</span>
                </div>
              )}

              {/* فلتر المدير */}
              {currentUser?.role === "admin" && selectedGrade !== "all" && (
                <div className="flex items-center gap-2 text-physics-gold">
                  <span>🎯</span>
                  <span>
                    {selectedGrade === "first" ? "الصف الأول" :
                     selectedGrade === "second" ? "الصف الثاني" : "الصف الثالث"}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* الفيديو المحدد */}
          {selectedVideo && <div className="bg-physics-dark rounded-lg overflow-hidden mb-6">
              {selectedVideoIsYouTube ?
                <PlyrYouTubePlayer
                  videoUrl={selectedVideo}
                  title={videos.find(v => v.url === selectedVideo)?.title || ""}
                  password={videos.find(v => v.url === selectedVideo)?.password}
                  blockedStudents={videos.find(v => v.url === selectedVideo)?.blockedStudents || []}
                  currentUserId={currentUser?.id}
                  className="w-full"
                /> :
                <VideoPlayerFixed
                  src={selectedVideo}
                  title={videos.find(v => v.url === selectedVideo)?.title || ""}
                  password={videos.find(v => v.url === selectedVideo)?.password}
                />
              }
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">
                    {videos.find(v => v.url === selectedVideo)?.title || ""}
                  </h2>
                  
                  {currentUser?.role === "admin" && <div className="flex gap-2">
                      <button onClick={() => {
                  const video = videos.find(v => v.url === selectedVideo);
                  if (video) openEditForm(video);
                }} className="p-2 text-physics-gold hover:text-white">
                        <Edit size={18} />
                      </button>
                      
                      <button onClick={() => {
                  const video = videos.find(v => v.url === selectedVideo);
                  if (video) handleDeleteVideo(video.id);
                }} className="p-2 text-red-500 hover:text-white">
                        <Trash size={18} />
                      </button>
                    </div>}
                </div>
                <button onClick={() => setSelectedVideo(null)} className="text-physics-gold hover:underline mt-2">
                  العودة للقائمة
                </button>
              </div>
            </div>}
          
          {/* قائمة الفيديوهات */}
          {!selectedVideo && <div className="bg-physics-dark rounded-lg overflow-hidden border border-physics-gold/20">
              {filteredVideos.length === 0 ? <div className="p-8 sm:p-12 text-center">
                  <div className="text-6xl mb-4">📹</div>
                  <h3 className="text-xl font-bold text-white mb-2">لا توجد فيديوهات</h3>
                  <p className="text-gray-400">
                    {searchQuery ? "لم يتم العثور على فيديوهات تطابق البحث" : "لا توجد فيديوهات متاحة حالياً"}
                  </p>
                  {currentUser?.role === "admin" && !searchQuery && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="mt-4 goldBtn flex items-center gap-2 mx-auto"
                    >
                      <FilePlus size={18} />
                      <span>إضافة أول فيديو</span>
                    </button>
                  )}
                </div> : <div className="divide-y divide-physics-navy/50">
                  {filteredVideos.map(video => <div key={video.id} className="p-4 sm:p-6 hover:bg-physics-navy/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <button
                            className="bg-physics-navy hover:bg-physics-gold hover:text-physics-dark p-3 sm:p-4 rounded-full transition-all duration-200 group"
                            onClick={() => handleSelectVideo(video)}
                          >
                            <Play size={20} className="text-physics-gold group-hover:text-physics-dark" />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleSelectVideo(video)}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg sm:text-xl font-medium text-white">
                                {video.title}
                              </h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                {video.isYouTube && (
                                  <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full flex items-center gap-1">
                                    <span>📺</span>
                                    <span>YouTube</span>
                                  </span>
                                )}
                                {video.password && (
                                  <span className="text-xs bg-physics-gold text-physics-dark px-2 py-1 rounded-full flex items-center gap-1">
                                    <span>🔒</span>
                                    <span>محمي</span>
                                  </span>
                                )}
                                {video.blockedStudents && video.blockedStudents.length > 0 && (
                                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full flex items-center gap-1">
                                    <span>🚫</span>
                                    <span>{video.blockedStudents.length} محظور</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-green-500 flex-shrink-0">
                              <Check size={16} />
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center text-sm text-gray-400 mt-2 gap-2">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{formatDate(video.uploadDate)}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <span>🎓</span>
                              <span>
                                {video.grade === "first" && "الأول الثانوي"}
                                {video.grade === "second" && "الثاني الثانوي"}
                                {video.grade === "third" && "الثالث الثانوي"}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {currentUser?.role === "admin" && (
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => openEditForm(video)}
                              className="p-2 text-physics-gold hover:bg-physics-gold hover:text-physics-dark rounded-lg transition-all duration-200"
                              title="تعديل الفيديو"
                            >
                              <Edit size={18} />
                            </button>

                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-200"
                              title="حذف الفيديو"
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>)}
                </div>}
            </div>}
        </div>
      </main>
      
      {/* نموذج إضافة فيديو - محسن للموبايل */}
      {showAddForm && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-physics-dark rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-physics-gold">إضافة فيديو جديد</h2>
              <button
                type="button"
                className="text-gray-400 hover:text-white p-1 touch-manipulation"
                onClick={() => setShowAddForm(false)}
                style={{
                  minWidth: '44px',
                  minHeight: '44px',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <X size={20} className="md:w-6 md:h-6" />
              </button>
            </div>
            
            <div className="flex justify-center mb-4">
              <div className="flex gap-2 md:gap-4 w-full">
                <button
                  className={`flex-1 px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium transition-colors touch-manipulation ${useYouTube ? 'bg-physics-gold text-physics-dark' : 'bg-physics-navy text-white hover:bg-physics-navy/80'}`}
                  onClick={() => setUseYouTube(true)}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  📺 فيديو يوتيوب
                </button>
              </div>
            </div>
            
            {useYouTube ? <form onSubmit={handleAddVideo} className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-white mb-2 text-sm md:text-base font-medium">عنوان الفيديو</label>
                  <input
                    type="text"
                    className="inputField text-sm md:text-base"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    placeholder="أدخل عنوان الفيديو..."
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  />
                </div>
                
                <div>
                  <label className="block text-white mb-2 text-sm md:text-base font-medium">رابط فيديو يوتيوب</label>
                  <input
                    type="text"
                    className="inputField text-sm md:text-base"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... أو youtu.be/... أو معرف الفيديو فقط"
                    required
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  />

                  {/* معاينة الرابط المحسن */}
                  {url && url.trim() && (
                    <div className="mt-2 p-2 bg-physics-navy/50 rounded border border-physics-gold/30">
                      <p className="text-xs text-gray-300 mb-1">الرابط بعد التحسين:</p>
                      <p className="text-xs text-physics-gold font-mono break-all">
                        {improveYouTubeUrl(url)}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 mt-2 space-y-1">
                    <p>✅ يدعم جميع أنواع روابط اليوتيوب:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>الروابط العادية: youtube.com/watch?v=...</li>
                      <li>الروابط المختصرة: youtu.be/...</li>
                      <li>روابط Shorts: youtube.com/shorts/...</li>
                      <li>روابط التضمين: youtube.com/embed/...</li>
                      <li>معرف الفيديو فقط (11 حرف)</li>
                    </ul>
                    <p className="text-physics-gold">💡 سيتم إصلاح الروابط التالفة تلقائياً</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-white mb-2 text-sm md:text-base font-medium">الصف الدراسي</label>
                  <select
                    className="inputField text-sm md:text-base"
                    value={grade}
                    onChange={e => setGrade(e.target.value as "first" | "second" | "third")}
                    required
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <option value="first">الصف الأول الثانوي</option>
                    <option value="second">الصف الثاني الثانوي</option>
                    <option value="third">الصف الثالث الثانوي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2 text-sm md:text-base font-medium">كلمة مرور الفيديو (اختيارية)</label>
                  <input
                    type="password"
                    className="inputField text-sm md:text-base"
                    value={videoPassword}
                    onChange={e => setVideoPassword(e.target.value)}
                    placeholder="اتركها فارغة إذا كان الفيديو غير محمي"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    إذا تم تعيين كلمة مرور، سيطلب من الطلاب إدخالها قبل مشاهدة الفيديو
                  </p>
                </div>

                <div>
                  <label className="block text-white mb-2 text-sm md:text-base font-medium">حظر طلاب محددين</label>
                  <button
                    type="button"
                    onClick={() => setShowBlockingModal(true)}
                    className="w-full bg-physics-navy border border-physics-gold/30 rounded-lg px-4 py-3 text-white hover:bg-physics-navy/80 transition-colors flex items-center justify-between"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div className="flex items-center gap-2">
                      <UserX size={20} className="text-physics-gold" />
                      <span>
                        {blockedStudents.length > 0
                          ? `تم حظر ${blockedStudents.length} طالب`
                          : 'اختيار الطلاب المحظورين'
                        }
                      </span>
                    </div>
                    <span className="text-physics-gold">›</span>
                  </button>
                  <p className="text-xs text-gray-400 mt-1">
                    الطلاب المحظورين لن يتمكنوا من مشاهدة هذا الفيديو
                  </p>
                </div>

                <div className="flex gap-2 md:gap-4 pt-4">
                  <button
                    type="submit"
                    className="goldBtn flex-1 py-2 md:py-3 px-3 md:px-4 text-sm md:text-base font-medium touch-manipulation"
                    disabled={!url || !title}
                    style={{
                      minHeight: '44px',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                  >
                    إضافة الفيديو
                  </button>
                  <button
                    type="button"
                    className="bg-physics-navy hover:bg-physics-navy/80 text-white py-2 md:py-3 px-3 md:px-4 rounded-lg flex-1 text-sm md:text-base font-medium transition-colors touch-manipulation"
                    onClick={() => setShowAddForm(false)}
                    style={{
                      minHeight: '44px',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                  >
                    إلغاء
                  </button>
                </div>
              </form> : <>
                {!showUploader ? <button onClick={() => setShowUploader(true)} className="w-full p-4 border-2 border-dashed border-physics-gold rounded-lg text-center hover:bg-physics-navy/30 transition">
                    
                  </button> : <VideoUploader onVideoURLGenerated={handleVideoURLGenerated} />}
                
                {showUploader && url && <form onSubmit={handleAddVideo} className="space-y-4 mt-4 border-t border-physics-navy pt-4">
                    <div>
                      <label className="block text-white mb-1">عنوان الفيديو</label>
                      <input type="text" className="inputField" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    
                    <div>
                      <label className="block text-white mb-1">الصف الدراسي</label>
                      <select className="inputField" value={grade} onChange={e => setGrade(e.target.value as "first" | "second" | "third")} required>
                        <option value="first">الصف الأول الثانوي</option>
                        <option value="second">الصف الثاني الثانوي</option>
                        <option value="third">الصف الثالث الثانوي</option>
                      </select>
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                      <button type="submit" className="goldBtn flex-1" disabled={!url || !title}>
                        إضافة الفيديو
                      </button>
                    </div>
                  </form>}
              </>}
          </div>
        </div>}
      
      {/* نموذج تعديل الفيديو */}
      {showEditForm && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-physics-gold mb-6">تعديل الفيديو</h2>
            
            <form onSubmit={handleEditVideo} className="space-y-4">
              <div>
                <label className="block text-white mb-1">عنوان الفيديو</label>
                <input type="text" className="inputField" value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
              </div>
              
              <div>
                <label className="block text-white mb-1">
                  {editIsYouTube ? 'رابط فيديو يوتيوب' : 'رابط الفيديو'}
                </label>
                <input
                  type="text"
                  className="inputField text-sm md:text-base"
                  value={editUrl}
                  onChange={e => setEditUrl(e.target.value)}
                  required
                  placeholder={editIsYouTube ? "https://www.youtube.com/watch?v=... أو youtu.be/..." : "https://..."}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                />
                {editIsYouTube ? (
                  <div className="text-xs text-gray-400 mt-2">
                    <p>✅ يدعم جميع أنواع روابط اليوتيوب مع الإصلاح التلقائي</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-300 mt-1">
                    أدخل رابط مباشر للفيديو (mp4, webm, mov, avi, 3gp)
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-white mb-1">الصف الدراسي</label>
                <select className="inputField" value={editGrade} onChange={e => setEditGrade(e.target.value as "first" | "second" | "third")} required>
                  <option value="first">الصف الأول الثانوي</option>
                  <option value="second">الصف الثاني الثانوي</option>
                  <option value="third">الصف الثالث الثانوي</option>
                </select>
              </div>

              <div>
                <label className="block text-white mb-1">كلمة مرور الفيديو (اختيارية)</label>
                <input
                  type="password"
                  className="inputField"
                  value={editVideoPassword}
                  onChange={e => setEditVideoPassword(e.target.value)}
                  placeholder="اتركها فارغة إذا كان الفيديو غير محمي"
                />
                <p className="text-xs text-gray-400 mt-1">
                  إذا تم تعيين كلمة مرور، سيطلب من الطلاب إدخالها قبل مشاهدة الفيديو
                </p>
              </div>

              <div>
                <label className="block text-white mb-1">حظر طلاب محددين</label>
                <button
                  type="button"
                  onClick={() => setShowEditBlockingModal(true)}
                  className="w-full bg-physics-navy border border-physics-gold/30 rounded-lg px-4 py-3 text-white hover:bg-physics-navy/80 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <UserX size={20} className="text-physics-gold" />
                    <span>
                      {editBlockedStudents.length > 0
                        ? `تم حظر ${editBlockedStudents.length} طالب`
                        : 'اختيار الطلاب المحظورين'
                      }
                    </span>
                  </div>
                  <span className="text-physics-gold">›</span>
                </button>
                <p className="text-xs text-gray-400 mt-1">
                  الطلاب المحظورين لن يتمكنوا من مشاهدة هذا الفيديو
                </p>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="submit" className="goldBtn flex-1">
                  حفظ التغييرات
                </button>
                <button type="button" className="bg-physics-navy text-white py-2 px-4 rounded-lg flex-1" onClick={() => setShowEditForm(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>}

      {/* نافذة حظر الطلاب للإضافة */}
      <StudentBlockingModal
        isOpen={showBlockingModal}
        onClose={() => setShowBlockingModal(false)}
        onStudentsSelected={setBlockedStudents}
        currentBlockedStudents={blockedStudents}
        videoTitle={title}
      />

      {/* نافذة حظر الطلاب للتعديل */}
      <StudentBlockingModal
        isOpen={showEditBlockingModal}
        onClose={() => setShowEditBlockingModal(false)}
        onStudentsSelected={setEditBlockedStudents}
        currentBlockedStudents={editBlockedStudents}
        videoTitle={editTitle}
      />
    </div>;
};

export default Videos;
