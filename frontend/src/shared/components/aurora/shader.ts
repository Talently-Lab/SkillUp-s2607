export const VERTEX_SHADER =
  "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

/* Three soft ribbons (teal, violet, lilac→sun) over the indigo base.
   `sm` darkens one area so text stays readable: 0 left, 1 center, 2 none. */
export const FRAGMENT_SHADER = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec2 m;uniform float e;uniform float sm;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int k=0;k<5;k++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
float ribbon(vec2 uv,float y0,float tilt,float w,float sp,float seed){
 float x=uv.x;
 float wave=fbm(vec2(x*1.3+seed,t*sp))*.55+sin(x*2.2+t*sp*3.+seed)*.05;
 float d=uv.y-(y0+x*tilt+wave-.27);
 float core=exp(-d*d/(w*w));
 float rays=.55+.45*fbm(vec2(x*18.+seed,t*.25+d*2.));
 return core*rays;}
void main(){
 vec2 uv=gl_FragCoord.xy/r;vec2 a=uv;a.x*=r.x/r.y;
 vec2 mm=(m-.5)*vec2(.25,.18);
 vec2 q=a+mm*smoothstep(1.2,.0,distance(uv,m));
 vec3 base=mix(vec3(.106,.059,.271),vec3(.165,.086,.439),smoothstep(0.,1.,uv.y*.6+uv.x*.5));
 float sp=.035+e*.03;
 float r1=ribbon(q,.55,.32,.085+e*.02,sp,0.);
 float r2=ribbon(q*vec2(.9,1.)+vec2(.3,0),.42,.25,.12,sp*.8,4.1);
 float r3=ribbon(q*vec2(1.1,1.)-vec2(.2,0),.7,.18,.06,sp*1.2,9.3);
 vec3 teal=vec3(.184,.851,.753),vio=vec3(.427,.247,.878),lil=vec3(.66,.52,1.),sun=vec3(1.,.79,.30);
 vec3 c=base;
 c+=vio*r2*.85;
 c+=mix(teal,lil,smoothstep(.3,1.,uv.y))*r1*(.8+e*.5);
 c+=mix(lil,sun,smoothstep(.6,1.2,a.x))*r3*.45;
 float grain=(h(gl_FragCoord.xy+fract(t))-.5)*.035;
 float shade=0.;
 if(sm<.5){float port=smoothstep(1.05,.8,r.x/r.y);shade=mix(smoothstep(.62,.0,uv.x)*.72,smoothstep(.85,.3,uv.y)*.82,port);}
 else if(sm<1.5){shade=smoothstep(.15,.55,1.-distance(uv,vec2(.5))*1.6)*.6;}
 c=mix(c,base*.8,shade);
 gl_FragColor=vec4(c+grain,1.);}`;
