const fs = require('fs');
const file = 'src/app/project/[id]/ProjectClient.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                      <p className="text-xs font-medium text-muted-foreground line-clamp-2 mt-1">
                        {k.description}
                      </p>
                      {/* Author info */}`;
const replacement = `                      <p className="text-xs font-medium text-muted-foreground line-clamp-2 mt-1 mb-2">
                        {k.description}
                      </p>
                      {/* Stats */}
                      <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <FiEye className="w-3.5 h-3.5" />
                          {k.views ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiHeart className="w-3.5 h-3.5" />
                          {k.likes ?? 0}
                        </span>
                      </div>
                      {/* Author info */}`;

if(content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content);
    console.log("Patched successfully");
} else {
    console.log("Target not found");
}
