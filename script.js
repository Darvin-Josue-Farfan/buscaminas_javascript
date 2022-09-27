$(function(){

    let tablero = "";
    let mines_location = [];
    let GameOver = false;
    
    let row = 8;
    let col = 10;
    let mines = 10;
    let time = 0;
    let running = false;
    let reveladas = 0;

    let aux_load_level = false;

    let sounds = {
        "select": "./assets/select.wav",
        "flag": "./assets/flag.wav",
        "explosion": "./assets/explosion.wav"
    }

    for(let key in sounds){
        let url = sounds[key];
        sounds[key] = new Audio(url);
    }

    let dificultad_anterior =  $(".dificultad").first();

    $(".dificultad").on("click", function(){

        if( running ) return;

        let current = $(this);
        let color = $(this).data("color");

        if( $(current).is(dificultad_anterior) )return;

        if( dificultad_anterior !== false )
            $(dificultad_anterior).css("color", "#6c757d");

        $(current).removeClass("text-muted").css({color});

        $("#time").html("00:00");
        $("#flag").html("000");

        switch(color){

            case "#0dcaf0":
                $("#display_dificultad").html(`<span style='color:${color}'>Fácil</span>`);
                row = 8;
                col = 10;
                mines = "010";
            break;

            case "#0d6efd":
                $("#display_dificultad").html(`<span style='color:${color}'>Intermedio</span>`);
                row = 14;
                col = 18;
                mines = "040";
            break;

            case "#dc3545": $("#display_dificultad").html(`<span style='color:${color}'>Experto</span>`);
                row = 20;
                col = 24;
                mines = "099";
            break;

            case "#cc08b2":
                $("#display_dificultad").html(`<span style='color:${color}'>Locura</span>`);
                row = 20;
                col = 26;
                mines = "150";
            break;
        }

        $("#mines").html(mines);

        dificultad_anterior = current;
        cargarTable();
    });

    cargarTable();
    
    $("#start").on("click", function(){

        //if( !aux_load_level )
            cargarTable();

        $("#start").html("Reiniciar");

        GameOver = false;
        reveladas = 0;
        running = true;
        $("#time").html("<span class='text-info'>00:00</span>");
        displayMinesAndFlag();
        displayTime();
    });

    function cargarTable(){

        let $table = $("#table");
      
        $("#mensaje").empty();

        $table.empty();

        for(let i = 0; i < row; i++){

            let tr = "<tr>";
                tr += "<td class='hide'></td>".repeat(col);
            tr += "</tr>";

            $table.append(tr);
        }

        generateRamdonTablero(row, col, mines);
        aux_load_level = true;
    }

    function generateRamdonTablero(row, col, mines){

        function shuffleMines(tbl, total, total_mines) {

            let shuffle_indexs = [...Array(total).keys()];
            shuffle_indexs = shuffle_indexs.sort(function() {return Math.random() - 0.5});

            for(let i = 0; i < total_mines; i++){
                tbl[shuffle_indexs[i]] = '*';
                mines_location.push(shuffle_indexs[i]);
            }

            return tbl;
        }

        mines_location = [];
        tablero = "";

        const total = row * col;
        tablero = "0".repeat(total);
        tablero = tablero.split("");
        tablero = shuffleMines(tablero, total, mines);
        
        tablero = tablero.reduce( (prev, current, i) => {
            const ch = Math.floor(i/col); 
            prev[ch] = [].concat( ( prev[ch] || [] ), current); 
            return prev;
        }, []);


        for(let k = 0; k < mines_location.length; k++){

            [i, j] = [ mines_location[k] % col, Math.floor( mines_location[k] / col ) ];

            let around = [
                {x: i-1, y: j-1},
                {x: i-1, y: j },
                {x: i-1, y: j + 1},
                {x: i, y: j-1 },
                {x: i, y: j + 1},
                {x: i + 1, y: j-1},
                {x: i + 1, y: j},
                {x: i + 1, y: j + 1}
            ];

            for(let k in around){
                [aux_x, aux_y] = [around[k].x, around[k].y];
                if( aux_x >= 0 && aux_y >= 0 && aux_x < col && aux_y < row )
                    if( tablero[aux_y][aux_x] != '*' )
                        tablero[aux_y][aux_x] = parseInt(tablero[aux_y][aux_x]) + 1;
            }

        }
      
    }
    
    function revelarTablero(refFail){

        if( refFail ){

            for(let j in tablero)
                for(let i in tablero[j]){
                    
                    let td = $(`#table tr:eq(${j}) td:eq(${i})`);
                    if( $(td).data("evaluate") ) continue;
                    if( $(td).hasClass("flag") && tablero[j][i] == '*' ) continue;

                    if( tablero[j][i] != '*' ){
                        $(td).css({"outline": "3px solid #0D6EFD"}).animate({
                            outlineWidth:  "14px",
                            outlineOffset: "-18px",
                        
                        }, 200, function(){
                            $(td).removeClass("hide").removeClass("flag")
                            .addClass("empty").html( getNumber(tablero[j][i]) )
                        
                        }).animate({ outlineWidth:  "0px", outlineOffset: "0px", }, 750);
                        continue;
                    }

                    $(td).removeClass("hide").addClass("mine");
                    $(td).css({"outline": "3px solid #FF7C00"}).animate({
                        outlineWidth:  "14px",
                        outlineOffset: "-18px",
                    }, 1000, function(){
                        
                    });
                    
                }

                $(refFail).removeClass("mine").addClass("mine_fail");
                $(refFail).css({ "outline":  "0px" });

        }else{

            for(let j in tablero)
                for(let i in tablero[j]){
                    
                    let td = $(`#table tr:eq(${j}) td:eq(${i})`);
                   
                    if( tablero[j][i] == '*' ){
                        $(td).removeClass("hide").addClass("flag");
                        
                    }else if( tablero[j][i] ){

                        $(td).css({"outline": "3px solid rgb(25,40,59)"}).animate({ //#2893E9
                            outlineWidth:  "14px",
                            outlineOffset: "-18px",
                        });

                    }

                }

        }

        
    }

    function getNumber(number){

        let data_color = {
            '0': '',
            '1': `<b style="color:#0080FF">1</b>`,
            '2': `<b style="color:#00994C">2</b>`,
            '3': `<b style="color:#FF0000">3</b>`,
            '4': `<b style="color:#003366">4</b>`,
            '5': `<b style="color:#660000">5</b>`,
            '6': `<b style="color:#990099">6</b>`,
            '7': `<b style="color:#006666">7</b>`,
            '8': `<b style="color:#000000">8</b>`,
        }

        return data_color[number];
    }

    $("#table").on("click", "td", function(e){

        if( !running ) return;
        if( GameOver ) return;

        [x, y] = [ $(this).index(), $(this).parent().index() ];

        if( $(this).data("evaluate") ) return;

        if( $(this).hasClass("flag") ){
            $(this).removeClass("flag").addClass("hide");
            displayMinesAndFlag();
            sounds["flag"].play();
            return;
        }

        if( tablero[y][x] == '*' ){
            $("#start").html("Iniciar");
            GameOver = true;
            running = false;
            sounds["explosion"].play();
            revelarTablero( $(this) );
            aux_load_level = false;
            return;
        }

        let evaluate = recursiveDisplay({x, y, row: tablero.length, col: tablero[0].length });
        
        if( evaluate !== false )
            sounds["select"].play();

        //comprobar si ha ganado

        let total_tablero = row * col;
        let total_flags = $("#table > tr > td.flag").length;
        let cubiertas = $("#table > tr > td.hide").length;

        if( (total_flags + cubiertas == mines ) && (total_flags + cubiertas + reveladas == total_tablero) ){
            revelarTablero();
            $("#start").html("Iniciar");
            GameOver = true;
            running = false;
            aux_load_level = false;
        }

        displayMinesAndFlag();

    });

    document.oncontextmenu = rightClick;
    document.onselectstart = function(){ return false; } 
    //document.onmousedown = function() { return false; }
    
    function rightClick(e) {

        e.preventDefault();

        if( !running ) return;

        if( GameOver ) return;

        let element = e.srcElement;

        if( mines - $("#table > tr > td.flag").length <= 0 && $(element).hasClass("hide") )
            return;

        if( $(element).hasClass("hide") ){
            $(element).removeClass("hide").addClass("flag");
            displayMinesAndFlag();
            sounds["flag"].play();

        }else if( $(element).hasClass("flag") ){
            $(element).removeClass("flag").addClass("hide");
            sounds["flag"].play();
        }
        
    }

    function recursiveDisplay(obj){

        let td = $(`#table tr:eq(${obj.y}) td:eq(${obj.x})`);
        let selected = $(td).data("evaluate");
        let classFlag = $(td).hasClass("flag");

        if( selected || classFlag ) return false;
        if( obj.x < 0 || obj.y < 0 || obj.x >= obj.col || obj.y >= obj.row ) return;

        $(td).data("evaluate", 1);

        let character = tablero[obj.y][obj.x];

        if( character == '*' ) return;

        displayObjectOnyClass(td);

        $(td).css({"outline": "3px solid #0d6efd"}).animate({
            outlineWidth:  "14px",
            outlineOffset: "-18px",
        }, 200, function(){
            displayObjectOnyCharacter(this, character);
        }).animate({
            outlineWidth:  "0px",
            outlineOffset: "0px",
        }, 350);
        
        reveladas++;

        if( character != '0' ) return; 

        [i, j] = [obj.x, obj.y];

        let around = [
            {x: i-1, y: j-1},
            {x: i-1, y: j},
            {x: i-1, y: j + 1},
            {x: i, y: j-1},
            {x: i, y: j + 1},
            {x: i + 1, y: j-1},
            {x: i + 1, y: j},
            {x: i + 1, y: j + 1}
        ];

        for(let n = 0; n <= 7; n++ )
            recursiveDisplay({ ...around[n], row: obj.row , col: obj.col });
    }

    function displayObjet(nodeElem, character){
        $(nodeElem).removeClass("hide").addClass("empty").html( getNumber(obj.character) );
    }

    function displayObjectOnyClass(nodeElem){
        $(nodeElem).removeClass("hide").addClass("empty");
    }

    function displayObjectOnyCharacter(nodeElem, character){
        $(nodeElem).html( getNumber(character) );
    }

    function completeNumber(number){
        if(number < 10 ) return "00" + number;
        if(number < 100) return "0" + number;
        return number;
    }

    function displayMinesAndFlag(){
        $("#flag").html( "<span class='text-primary' >" + completeNumber( $("#table > tr > td.flag").length) + "</span>" );
        $("#mines").html( "<span class='text-danger' >" + completeNumber( mines - parseInt($("#flag").text())) + "</span>" );
    }

    let intervalTime = false;
    function displayTime(){
        
        time = new Date();
        time = time.getTime();

        intervalTime = setInterval(function(){

            let now = new Date();
            now = now.getTime();
            now -= time;
            
            if( now < 3600000 )
                now = new Date(now).toISOString().substring(14, 19);
            else
                now = new Date(now).toISOString().substring(11, 16);
            
            $("#time").html(`<span class="text-info">${now}</span>`);

            if( GameOver || !running ){
                time = now;
                clearInterval(intervalTime);
            }

        }, 1000);
    }

});