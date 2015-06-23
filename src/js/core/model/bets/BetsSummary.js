define(['underscore'], function(_){

	function BetsSummary(singleBets, systemBets, forecastBets){
		this.singleBets = singleBets;
		this.systemBets = systemBets;
		this.forecastBets = forecastBets;
	};

	_.extend(BetsSummary.prototype, {
		getBetsByIds: function(betIds) {

			var results = new BetsSummary([], [], []);

			for (var i in betIds) {
				var betId = betIds[i];

				for (var j in this.singleBets) {
					if (this.singleBets[j].id == betId) {
						results.singleBets.push(this.singleBets[j]);
					}
				}

				for (var j in this.systemBets) {
					if (this.systemBets[j].id == betId) {
						results.systemBets.push(this.systemBets[j]);
					}
				}
			}

			return results;
		},


		updateCashouts: function(cashoutArray) {

			for (var i = 0; i < this.singleBets.length; i++)
			{
				var bet = this.singleBets[i];

				for (var j = 0; j < cashoutArray.length; j++)
				{
					var cashout = cashoutArray[j];
					if( bet.id == cashout.betId )
					{
						console.log('CASH OUT VALUE RETURNED '+cashout.cashoutValue);
						bet.cashoutValue = cashout.cashoutValue;
						break;
					}
				}
			}

			for (var i = 0; i < this.systemBets.length; i++)
			{
				var bet = this.systemBets[i];

				for (var j = 0; j < cashoutArray.length; j++)
				{
					var cashout = cashoutArray[j];
					if( bet.id == cashout.betId )
					{
						console.log('CASH OUT VALUE RETURNED '+cashout.cashoutValue);
						bet.cashoutValue = cashout.cashoutValue;
						break;
					}
				}
			}
		}


	})

	return BetsSummary;
});