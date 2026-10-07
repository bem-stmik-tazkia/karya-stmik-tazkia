const fs = require('fs');
const file = 'src/app/submit/form/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix handleFitur mutation
content = content.replace(
  `const handleFitur = (index: number, field: string, value: string) => {\n    const f = [...formData.features];\n    f[index][field] = value;\n    setFormData(prev => ({ ...prev, features: f }));\n  };`,
  `const handleFitur = (index: number, field: string, value: string) => {\n    const f = formData.features.map((item, i) => i === index ? { ...item, [field]: value } : item);\n    setFormData(prev => ({ ...prev, features: f }));\n  };`
);

// Fix handleTim mutation
content = content.replace(
  `const handleTim = (index: number, field: string, value: string) => {\n    const u = [...formData.team];\n    u[index][field] = value;\n    setFormData(prev => ({ ...prev, team: u }));\n  };`,
  `const handleTim = (index: number, field: string, value: string) => {\n    const u = formData.team.map((item, i) => i === index ? { ...item, [field]: value } : item);\n    setFormData(prev => ({ ...prev, team: u }));\n  };`
);

// Fix handleGallery mutation
content = content.replace(
  `const handleGallery = (index: number, field: string, value: string) => {\n    const g = [...formData.gallery];\n    g[index][field] = value;\n    setFormData(prev => ({ ...prev, gallery: g }));\n  };`,
  `const handleGallery = (index: number, field: string, value: string) => {\n    const g = formData.gallery.map((item, i) => i === index ? { ...item, [field]: value } : item);\n    setFormData(prev => ({ ...prev, gallery: g }));\n  };`
);

// Fix TeamMemberAutocomplete mutation
content = content.replace(
  `const u = [...formData.team];
                            u[i].name = name;
                            if (user_id !== undefined) u[i].user_id = user_id;
                            if (avatar !== undefined) u[i].avatar = avatar;
                            setFormData(prev => ({ ...prev, team: u }));`,
  `const u = formData.team.map((item, idx) => {
                              if (idx !== i) return item;
                              const updated = { ...item, name };
                              if (user_id !== undefined) updated.user_id = user_id;
                              if (avatar !== undefined) updated.avatar = avatar;
                              return updated;
                            });
                            setFormData(prev => ({ ...prev, team: u }));`
);

fs.writeFileSync(file, content);
console.log("Patched array mutations in submit form successfully.");
