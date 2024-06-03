const BettingContract = artifacts.require("BettingContract");

contract("BettingContract", (accounts) => {
	let contractInstance;
	const [owner, alice, bob, clark] = accounts;
	const ONE_ETHER = web3.utils.toWei("1", "ether");

	beforeEach(async () => {
		contractInstance = await BettingContract.new({ from: owner });
	});

	it("should deploy the contract with the correct owner", async () => {
		const contractOwner = await contractInstance.owner();
		assert.equal(contractOwner, owner, "Owner is not correctly assigned.");
	});

	it("should allow owner to start betting", async () => {
		await contractInstance.startBetting({ from: owner });
		const bettingActive = await contractInstance.bettingActive();
		assert.equal(bettingActive, true, "Betting should be active.");
	});

	it("should not allow non-owner to start betting", async () => {
		try {
			await contractInstance.startBetting({ from: alice });
			assert.fail("Non-owner should not be able to start betting.");
		} catch (error) {
			assert.include(
				error.message,
				"Caller is not the owner",
				"Error should be related to ownership."
			);
		}
	});

	it("should accept bets when betting is active", async () => {
		await contractInstance.startBetting({ from: owner });
		await contractInstance.bet(1, { from: alice, value: ONE_ETHER });
		const bet = await contractInstance.bets(1, 0);
		assert.equal(bet.bettor, alice, "Bet should be recorded from Alice.");
		assert.equal(bet.amount, ONE_ETHER, "Bet amount should be 1 ether.");
	});

	it("should not accept bets when betting is not active", async () => {
		try {
			await contractInstance.bet(1, { from: bob, value: ONE_ETHER });
			assert.fail("Should not accept bets when betting is not active.");
		} catch (error) {
			assert.include(
				error.message,
				"Betting is not active",
				"Error should state that betting is not active."
			);
		}
	});

	it("should end betting when there are more than 2 slots with money", async () => {
		try {
			await contractInstance.startBetting({ from: owner });

			await contractInstance.bet(2, { from: alice, value: ONE_ETHER });
			await contractInstance.bet(2, { from: bob, value: ONE_ETHER });

			await contractInstance.endBetting({ from: owner });

			assert.fail(
				"should end betting when there are more than 2 slots with money"
			);
		} catch (error) {
			assert.include(error.message, "Betting must be in more than one slot.");
		}
	});

	it("should bet to only one slot with one wallet", async () => {
		try {
			await contractInstance.startBetting({ from: alis });

			await contractInstance.bet(2, { from: alice, value: ONE_ETHER });
			await contractInstance.bet(1, { from: alice, value: ONE_ETHER });

			assert.fail("should bet to only one slot with one wallet");
		} catch (error) {
			assert.include(error.message, "User has already placed a bet this round");
		}
	});

	it("should reset bets after distribution", async () => {
		await contractInstance.startBetting({ from: owner });
		await contractInstance.bet(2, { from: alice, value: ONE_ETHER });
		await contractInstance.bet(3, {
			from: bob,
			value: web3.utils.toWei("2", "ether"),
		});
		await contractInstance.endBetting({ from: owner });

		const totalBetAmount = await contractInstance.totalBetAmount();
		assert.equal(
			totalBetAmount.toNumber(),
			0,
			"Total bet amount should be reset to 0."
		);
	});
});
