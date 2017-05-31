window.addEventListener('load', pageInit);


var gl;
var step = Float32Array.BYTES_PER_ELEMENT;
var lightNearPlane = 15;
var lightFarPlane = 100;
function pageInit() {
    var canvas = document.getElementById('canvas');
    canvas.width  = innerWidth;
    canvas.height = innerHeight;

    var names = ["webgl", "experimental-webgl"];
	for(var i in names) {
        try {
            gl = canvas.getContext(names[i], { });

            if (gl && typeof gl.getParameter == "function") {
                // WebGL is enabled 
                break;
            }
        } catch(e) { }
    }

    if(gl === null) alert("could not initialize WebGL");
    var ext = gl.getExtension('WEBGL_depth_texture');



    window.projection = mat4.create();
    window.lightprojection = mat4.create();
    window.model      = mat4.create();
    window.view       = mat4.create();
    window.lightview  = mat4.create();
    window.lightviewproj = mat4.create();
    mat4.perspective(projection, 45 / 180 * Math.PI, innerWidth / innerHeight, 1, 100);
    // this gets reassigned at every drawcall on light.js
    mat4.perspective(lightprojection, Math.PI / 2, 1, lightNearPlane, lightFarPlane);
    // similiar triangles,      Opposite side = tangent angle * adjacent side
    // but that's retarded since we have a 90° frustum which literally is half-of a square, so we want the dimension of 
    // the diagonal, which is two times the z
    // window.lightmapNearPlaneSize = (Math.tan(Math.PI / 4) * 5)    * 2;
    window.lightmapFarPlaneSize = lightFarPlane * 2;

    // the code for the camera was written when I knew nothing about javascript,
    // don't look inside if you don't want your eyes to bleed to death
    window.camera     = new createCamera();
    camera.pos        = [0, 10, 17];
    camera.pitch      = -0.3;







    gl.enable(gl.DEPTH_TEST);
    createLightFBO();
    createLightMapProgram();
    createMainProgram();
    createPostProcessProgram();
    initGui();
    render();
}


var then = 0;
function render(now) {
    requestAnimationFrame(render);
    now *= 0.001;
    var deltatime = now - then;
    then = now;

    drawLightMap(now);
    drawScene(deltatime);
    // drawLightMapToScreen();
}








function initGui() {
    window.effectController = {
        searchTexelSpread: 1.0, 
        lightSize: 1.0,
        rotateLight: true,
        debug: 0.0,
    };

    var gui = new dat.GUI();

    gui.add(effectController, "searchTexelSpread", 0.3, 10.0);
    gui.add(effectController, "lightSize", 0, 105.0);
    gui.add(effectController, "debug", -3.0, 3.0).step(0.01);
    gui.add(effectController, "rotateLight");
}