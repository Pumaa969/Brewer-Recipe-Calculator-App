const Calc = {
    //OG-DENSIDAD INICIAL
    //Trabaja en libras y galones, transforma antes de calcular. PPG:Puntos por libra por galon 
    og(fermentables,volumenL,eficiencia){
        if(!fermentables.length || volumenL <=0) return 1.000;
        const ef=eficiencia/100;
        const gallons=volumenL*0.264172; //Convertir litros a galones
        const totalPPG=fermentables.reduce((sum,f)=>{
            const lbs=f.kg*2.20462; //Convertir kg a libras
            return sum+(lbs*f.ppg *ef);
        },0);

        return 1 + (totalPPG/gallons/1000);

    },

    //FG-DENSIDAD FINAL
    //Promedio entre atenuacion minima y maxima de la leva
    fg(og,atenuacionMin,atenuacionMax){
        const atenuacion=((atenuacionMin+atenuacionMax)/2)/100;
        return 1 + (og-1)*(1-atenuacion);
    },

    //ABV-ALCOHOL POR VOL
    abv(og,fg){
        return (og-fg)*131.25;
    },

    //ATENUACION APARENTE
    atenuacion(og,fg){
        if(og<=1)return 0;
        return((og-fg)/(og-1))*100;
    },
    
    //SRT- COLOR TEORICO DE LA CERVEZA
    srm(fermentables,volumenL){
        if(!fermentables.length||volumenL<=0) return 0;
        const gallons = volumenL * 0.264172;
        const mcu=fermentables.reduce((sum,f)=>{
            const lbs= f.kg * 2.20462;
            const lovibond = f.ebc/1.97; //EBC -> Lovibond
            return sum +(lbs *lovibond);
        },0)/gallons;
        return 1.4922*Math.pow(mcu,0.6859);
    },
}