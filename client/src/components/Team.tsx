import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { 
  GraduationCap, 
  Award, 
  Users, 
  BookOpen,
  Star,
  CheckCircle
} from "lucide-react";

export default function Team() {
  const team = [
    {
      id: 1,
      name: "د. سارة أحمد محمد",
      title: "أخصائية صعوبات التعلم - رئيسة الفريق",
      image: "/team/sarah.jpg", // placeholder
      qualifications: [
        "دكتوراه في التربية الخاصة - جامعة الملك سعود",
        "ماجستير في صعوبات التعلم - جامعة الإمام",
        "بكالوريوس علم النفس التربوي"
      ],
      certifications: [
        "معتمدة من الجمعية السعودية للتربية الخاصة",
        "عضو الجمعية الدولية للديسلكسيا (IDA)",
        "مدربة معتمدة في برنامج أورتن-جيلنجهام"
      ],
      experience: "15 سنة",
      specialization: "صعوبات القراءة والكتابة (الديسلكسيا)",
      sessions: "1200+",
      rating: 4.9
    },
    {
      id: 2,
      name: "أ. محمد عبدالله الغامدي",
      title: "أخصائي صعوبات التعلم",
      image: "/team/mohammed.jpg", // placeholder
      qualifications: [
        "ماجستير في التربية الخاصة - جامعة أم القرى",
        "بكالوريوس صعوبات التعلم - جامعة الطائف",
        "دبلوم في تقييم وتشخيص صعوبات التعلم"
      ],
      certifications: [
        "معتمد من وزارة التعليم السعودية",
        "عضو الجمعية السعودية للتربية الخاصة",
        "مدرب معتمد في برنامج ويلسون للقراءة"
      ],
      experience: "10 سنوات",
      specialization: "صعوبات التعلم للأطفال (6-12 سنة)",
      sessions: "850+",
      rating: 4.8
    },
    {
      id: 3,
      name: "أ. نورة خالد العتيبي",
      title: "أخصائية صعوبات التعلم",
      image: "/team/noura.jpg", // placeholder
      qualifications: [
        "ماجستير في صعوبات التعلم - جامعة الملك سعود",
        "بكالوريوس علم النفس - جامعة الأميرة نورة",
        "دبلوم في الإرشاد النفسي"
      ],
      certifications: [
        "معتمدة من الهيئة السعودية للتخصصات الصحية",
        "عضو الجمعية الأمريكية لصعوبات التعلم (LDA)",
        "مدربة معتمدة في برنامج لينداموود-بيل"
      ],
      experience: "8 سنوات",
      specialization: "صعوبات التعلم للمراهقين والطلاب الجامعيين",
      sessions: "600+",
      rating: 4.9
    },
    {
      id: 4,
      name: "أ. أحمد سعيد القحطاني",
      title: "أخصائي علم النفس التربوي",
      image: "/team/ahmed.jpg", // placeholder
      qualifications: [
        "ماجستير في علم النفس التربوي - جامعة الإمام",
        "بكالوريوس علم النفس - جامعة الملك فيصل",
        "دبلوم في التقييم النفسي"
      ],
      certifications: [
        "معتمد من الهيئة السعودية للتخصصات الصحية",
        "عضو الجمعية السعودية لعلم النفس",
        "مدرب معتمد في اختبارات وكسلر"
      ],
      experience: "12 سنة",
      specialization: "التقييم النفسي والمعرفي",
      sessions: "900+",
      rating: 4.7
    }
  ];

  const stats = [
    {
      icon: Users,
      value: "4",
      label: "أخصائيين معتمدين",
      color: "text-blue-600"
    },
    {
      icon: GraduationCap,
      value: "45+",
      label: "سنة خبرة مجمعة",
      color: "text-green-600"
    },
    {
      icon: BookOpen,
      value: "3500+",
      label: "جلسة تشخيص",
      color: "text-purple-600"
    },
    {
      icon: Star,
      value: "4.8",
      label: "متوسط التقييم",
      color: "text-yellow-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              فريقنا من الأخصائيين المعتمدين
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              نخبة من الأخصائيين المؤهلين والمعتمدين في مجال تشخيص صعوبات التعلم، 
              يعملون بشغف لمساعدة الأطفال والطلاب على تحقيق إمكاناتهم الكاملة
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center shadow-lg">
                <CardContent className="pt-6">
                  <stat.icon className={`w-12 h-12 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              تعرف على فريقنا
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              جميع أخصائيينا حاصلون على مؤهلات عليا ومعتمدون من الجهات الرسمية
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {team.map((member) => (
              <Card key={member.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className="md:flex">
                    {/* Image Placeholder */}
                    <div className="md:w-1/3 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-8">
                      <div className="text-white text-center">
                        <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-16 h-16" />
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xl font-bold">{member.rating}</span>
                        </div>
                        <div className="text-sm opacity-90">
                          {member.sessions} جلسة
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="md:w-2/3 p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {member.name}
                      </h3>
                      <p className="text-blue-600 font-medium mb-4">
                        {member.title}
                      </p>

                      <div className="space-y-4">
                        {/* Experience */}
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Award className="w-4 h-4" />
                            الخبرة
                          </div>
                          <p className="text-gray-600 text-sm">{member.experience} في مجال التشخيص والتقييم</p>
                        </div>

                        {/* Specialization */}
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <BookOpen className="w-4 h-4" />
                            التخصص
                          </div>
                          <Badge variant="secondary" className="text-sm">
                            {member.specialization}
                          </Badge>
                        </div>

                        {/* Qualifications */}
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <GraduationCap className="w-4 h-4" />
                            المؤهلات
                          </div>
                          <ul className="space-y-1">
                            {member.qualifications.map((qual, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{qual}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Certifications */}
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Award className="w-4 h-4" />
                            الاعتمادات
                          </div>
                          <ul className="space-y-1">
                            {member.certifications.map((cert, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span>{cert}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              اعتماداتنا وشراكاتنا
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              نفخر بحصولنا على اعتمادات من أبرز الجهات المحلية والدولية
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              "الهيئة السعودية للتخصصات الصحية",
              "الجمعية السعودية للتربية الخاصة",
              "الجمعية الدولية للديسلكسيا (IDA)",
              "الجمعية الأمريكية لصعوبات التعلم (LDA)"
            ].map((cert, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm text-gray-700 font-medium">{cert}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                جاهز للبدء مع فريقنا المتميز؟
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                احجز موعدك الآن واحصل على تشخيص احترافي من أخصائيين معتمدين
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/booking">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    احجز موعدك الآن
                  </Button>
                </Link>
                <Link to="/services">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white">
                    تعرف على الخدمات
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
