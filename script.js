$(function(){

    let tablero = "";
    let mines_location = [];
    let GameOver = false;

    let row;
    let col;
    let mines;

    let reveladas = 0;

    let sounds = {
        "select": "./assets/select.wav",
        "flag": "./assets/flag.wav",
        "explosion": "./assets/explosion.wav"
    }

    for(let key in sounds){
        let url = sounds[key];
        sounds[key] = new Audio(url);
    }

    $("#select_level").on("change", function(){

        let value = $(this).val();

        $("#colum,#row,#minas").prop("disabled", true);

        switch(value){

            case "PRINCIPIANTE": 
                $("#colum").val(8);
                $("#row").val(8);
                $("#minas").val(10);
            break;

            case "INTERMEDIO": 
                $("#colum").val(16);
                $("#row").val(16);
                $("#minas").val(40);
            break;

            case "EXPERTO": 
                $("#colum").val(30);
                $("#row").val(16);
                $("#minas").val(99);
            break;

            default:
                $("#colum,#row,#minas").prop("disabled", false);
            break;

        }

    });


    $("#start").on("click", function(){

        row = $("#row").val();
        col = $("#colum").val();
        mines = $("#minas").val();
        GameOver = false;
        reveladas = 0;

        $("#mensaje").empty();

        let $table = $("#table");

        $table.empty();

        for(let i = 0; i < row; i++){

            let tr = "<tr>";
                tr += "<td class='hide'></td>".repeat(col);
            tr += "</tr>";

            $table.append(tr);
        }

        generateRamdonTablero(row, col, mines);

    });

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

    
    function revelarTablero(flagByMine){

        let auxClass = flagByMine ? "flag" : "mine";

        for(let j in tablero)
            for(let i in tablero[j]){
                
                if( tablero[j][i] == '*' ){
                    $(`#table tr:eq(${j}) td:eq(${i})`).removeClass("hide").addClass(auxClass);
                    
                }else if( tablero[j][i] )
                    $(`#table tr:eq(${j}) td:eq(${i})`).removeClass("hide").removeClass("flag").addClass("empty")
                    .html( getNumber(tablero[j][i]) )
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

        if( GameOver ) return;

        [x, y] = [ $(this).index(), $(this).parent().index() ];

        if( $(this).hasClass("flag") ){
            $(this).removeClass("flag").addClass("hide");
            $("#mensaje").html(`<h3 class='text-primary'>Minas restantes: <span class="text-secondary">${ mines - $("#table > tr > td.flag").length }</span></h3>`);
            sounds["flag"].play();
            return;
        }

        if( tablero[y][x] == '*' ){
            GameOver = true;
            sounds["explosion"].play();
            revelarTablero(false);
            $("#mensaje").html("<h4 class='text-danger'><i class='fa-solid fa-face-frown'></i> ¡Has perdido!</h4>");
            $(`#table tr:eq(${y}) td:eq(${x})`).removeClass("mine").addClass("mine_fail");
            return;
        }

        let evaluate = recursiveDisplay({x, y, row: tablero.length, col: tablero[0].length });
        
        if( evaluate !== false )
            sounds["select"].play();

        if( 
            ( reveladas + $("#table > tr > td.flag").length + $("#table > tr > td.hide").length ) == (row * col) &&
            ( $("#table > tr > td.flag").length + $("#table > tr > td.hide").length == mines  )
        ){
            revelarTablero(true);
            $("#mensaje").html("<h3 class='text-success'><i class='fa-solid fa-face-smile'></i> ¡Felicidades! Has superado el reto</h3>");
            GameOver = true;
        
        }else
            $("#mensaje").html(`<h3 class='text-primary'>Minas restantes: <span class="text-secondary">${ mines - $("#table > tr > td.flag").length }</span></h3>`);
        

    });

    document.oncontextmenu = rightClick;
  
    function rightClick(e) {

        e.preventDefault();

        if( GameOver ) return;

        let element = e.srcElement;

        if( mines - $("#table > tr > td.flag").length <= 0 && $(element).hasClass("hide") )
            return;

        if( $(element).hasClass("hide") ){
            $(element).removeClass("hide").addClass("flag");
            $("#mensaje").html(`<h3 class='text-primary'>Minas restantes: <span class="text-secondary">${ mines - $("#table > tr > td.flag").length }</span></h3>`);
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

        if( tablero[obj.y][obj.x] == '*' ) return;

        displayObjet({x: obj.x, y: obj.y, character: tablero[obj.y][obj.x] });
        reveladas++;

        if( tablero[obj.y][obj.x] != '0' ) return; 

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

    function displayObjet(obj){
        $(`#table tr:eq(${obj.y}) td:eq(${obj.x})`).removeClass("hide").addClass("empty").html( getNumber(obj.character) );
    }

});